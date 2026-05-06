import net from 'node:net';
import tls from 'node:tls';
import crypto from 'node:crypto';

export type QueryRow = Record<string, any>;

const INT16 = 2;
const INT32 = 4;

function writeCString(parts: Buffer[], value: string) {
  parts.push(Buffer.from(value + '\0'));
}

function buildMessage(type: string | null, body: Buffer) {
  const len = Buffer.alloc(INT32);
  len.writeInt32BE(body.length + INT32, 0);
  return type ? Buffer.concat([Buffer.from(type), len, body]) : Buffer.concat([len, body]);
}

function xorBuffers(a: Buffer, b: Buffer) {
  const out = Buffer.alloc(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] ^ b[i];
  return out;
}

function parseError(body: Buffer) {
  const fields: Record<string, string> = {};
  let offset = 0;
  while (offset < body.length && body[offset] !== 0) {
    const code = String.fromCharCode(body[offset++]);
    const end = body.indexOf(0, offset);
    fields[code] = body.toString('utf8', offset, end);
    offset = end + 1;
  }
  return new Error(fields.M || 'PostgreSQL error');
}

function parseSaslPairs(value: string) {
  return Object.fromEntries(value.split(',').map((pair) => [pair.slice(0, 1), pair.slice(2)]));
}

export function sqlValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (value instanceof Date) return `'${value.toISOString().replace(/'/g, "''")}'`;
  if (Array.isArray(value) || typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function sqlId(value: string): string {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) throw new Error(`Unsafe SQL identifier: ${value}`);
  return `"${value}"`;
}

class WireReader {
  private queue: Buffer[] = [];
  private waiting: (() => void) | null = null;

  constructor(private socket: net.Socket | tls.TLSSocket) {
    socket.on('data', (chunk) => {
      this.queue.push(chunk);
      this.waiting?.();
      this.waiting = null;
    });
  }

  replaceSocket(socket: tls.TLSSocket) {
    this.socket = socket;
    socket.on('data', (chunk) => {
      this.queue.push(chunk);
      this.waiting?.();
      this.waiting = null;
    });
  }

  private bufferedLength() {
    return this.queue.reduce((sum, chunk) => sum + chunk.length, 0);
  }

  async readBytes(length: number): Promise<Buffer> {
    while (this.bufferedLength() < length) {
      await new Promise<void>((resolve) => { this.waiting = resolve; });
    }
    const out = Buffer.alloc(length);
    let copied = 0;
    while (copied < length) {
      const chunk = this.queue[0];
      const need = length - copied;
      if (chunk.length <= need) {
        chunk.copy(out, copied);
        copied += chunk.length;
        this.queue.shift();
      } else {
        chunk.copy(out, copied, 0, need);
        this.queue[0] = chunk.subarray(need);
        copied += need;
      }
    }
    return out;
  }

  async readMessage() {
    const header = await this.readBytes(5);
    const type = header.toString('utf8', 0, 1);
    const length = header.readInt32BE(1);
    const body = await this.readBytes(length - 4);
    return { type, body };
  }
}

export class PostgresClient {
  private socket: net.Socket | tls.TLSSocket | null = null;
  private reader: WireReader | null = null;
  private connected = false;
  private queryQueue: Promise<unknown> = Promise.resolve();
  private params: URL;

  constructor(databaseUrl = process.env.DATABASE_URL) {
    if (!databaseUrl) throw new Error('DATABASE_URL is required for PostgreSQL persistence.');
    this.params = new URL(databaseUrl);
  }

  async connect() {
    if (this.connected) return;
    const port = Number(this.params.port || 5432);
    const host = this.params.hostname;
    let socket = net.connect({ host, port });
    await new Promise<void>((resolve, reject) => {
      socket.once('connect', resolve);
      socket.once('error', reject);
    });
    this.socket = socket;
    this.reader = new WireReader(socket);

    const sslMode = this.params.searchParams.get('sslmode');
    const wantsSsl = sslMode === 'require' || (sslMode !== 'disable' && host !== 'localhost' && host !== '127.0.0.1');
    if (wantsSsl) {
      const sslBody = Buffer.alloc(4);
      sslBody.writeInt32BE(80877103, 0);
      socket.write(buildMessage(null, sslBody));
      const response = (await this.reader.readBytes(1)).toString('utf8');
      if (response === 'S') {
        const secure = tls.connect({ socket, servername: host, rejectUnauthorized: false });
        await new Promise<void>((resolve, reject) => {
          secure.once('secureConnect', resolve);
          secure.once('error', reject);
        });
        this.socket = secure;
        this.reader.replaceSocket(secure);
      }
    }

    await this.startup();
    this.connected = true;
  }

  async close() {
    if (this.socket && !this.socket.destroyed) this.socket.end(buildMessage('X', Buffer.alloc(0)));
    this.socket = null;
    this.connected = false;
  }

  private write(buffer: Buffer) {
    if (!this.socket) throw new Error('PostgreSQL socket is not connected.');
    this.socket.write(buffer);
  }

  private async startup() {
    const user = decodeURIComponent(this.params.username);
    const database = decodeURIComponent(this.params.pathname.replace(/^\//, ''));
    const password = decodeURIComponent(this.params.password);
    const protocol = Buffer.alloc(4);
    protocol.writeInt32BE(196608, 0);
    const parts = [protocol];
    writeCString(parts, 'user'); writeCString(parts, user);
    writeCString(parts, 'database'); writeCString(parts, database);
    writeCString(parts, 'client_encoding'); writeCString(parts, 'UTF8');
    parts.push(Buffer.from([0]));
    this.write(buildMessage(null, Buffer.concat(parts)));

    while (true) {
      const msg = await this.reader!.readMessage();
      if (msg.type === 'R') {
        const code = msg.body.readInt32BE(0);
        if (code === 0) continue;
        if (code === 3) this.write(buildMessage('p', Buffer.from(password + '\0')));
        else if (code === 5) {
          const salt = msg.body.subarray(4, 8);
          const md5 = crypto.createHash('md5').update(password + user).digest('hex');
          const response = 'md5' + crypto.createHash('md5').update(Buffer.concat([Buffer.from(md5), salt])).digest('hex');
          this.write(buildMessage('p', Buffer.from(response + '\0')));
        } else if (code === 10) {
          await this.handleScram(password, msg.body.subarray(4));
        } else throw new Error(`Unsupported PostgreSQL auth method: ${code}`);
      } else if (msg.type === 'E') throw parseError(msg.body);
      else if (msg.type === 'Z') return;
    }
  }

  private async handleScram(password: string, mechanisms: Buffer) {
    if (!mechanisms.toString('utf8').includes('SCRAM-SHA-256')) throw new Error('Server does not offer SCRAM-SHA-256.');
    const nonce = crypto.randomBytes(18).toString('base64');
    const clientFirstBare = `n=*,r=${nonce}`;
    const clientFirst = `n,,${clientFirstBare}`;
    const mech = Buffer.from('SCRAM-SHA-256\0');
    const data = Buffer.from(clientFirst);
    const len = Buffer.alloc(4); len.writeInt32BE(data.length, 0);
    this.write(buildMessage('p', Buffer.concat([mech, len, data])));

    const first = await this.reader!.readMessage();
    if (first.type === 'E') throw parseError(first.body);
    if (first.type !== 'R' || first.body.readInt32BE(0) !== 11) throw new Error('Invalid SCRAM server-first response.');
    const serverFirst = first.body.subarray(4).toString('utf8');
    const pairs = parseSaslPairs(serverFirst);
    const clientFinalWithoutProof = `c=biws,r=${pairs.r}`;
    const authMessage = `${clientFirstBare},${serverFirst},${clientFinalWithoutProof}`;
    const saltedPassword = crypto.pbkdf2Sync(password, Buffer.from(pairs.s, 'base64'), Number(pairs.i), 32, 'sha256');
    const clientKey = crypto.createHmac('sha256', saltedPassword).update('Client Key').digest();
    const storedKey = crypto.createHash('sha256').update(clientKey).digest();
    const clientSignature = crypto.createHmac('sha256', storedKey).update(authMessage).digest();
    const proof = xorBuffers(clientKey, clientSignature).toString('base64');
    this.write(buildMessage('p', Buffer.from(`${clientFinalWithoutProof},p=${proof}`)));

    const final = await this.reader!.readMessage();
    if (final.type === 'E') throw parseError(final.body);
    if (final.type !== 'R' || final.body.readInt32BE(0) !== 12) throw new Error('Invalid SCRAM server-final response.');
  }

  async query<T extends QueryRow = QueryRow>(sql: string): Promise<T[]> {
    const run = async () => {
      await this.connect();
      this.write(buildMessage('Q', Buffer.from(sql + '\0')));
      let fields: string[] = [];
      const rows: T[] = [];
      while (true) {
        const msg = await this.reader!.readMessage();
        if (msg.type === 'T') {
          let offset = 2;
          const count = msg.body.readInt16BE(0);
          fields = [];
          for (let i = 0; i < count; i++) {
            const end = msg.body.indexOf(0, offset);
            fields.push(msg.body.toString('utf8', offset, end));
            offset = end + 19;
          }
        } else if (msg.type === 'D') {
          let offset = 2;
          const count = msg.body.readInt16BE(0);
          const row: QueryRow = {};
          for (let i = 0; i < count; i++) {
            const len = msg.body.readInt32BE(offset); offset += 4;
            if (len === -1) row[fields[i]] = null;
            else {
              const value = msg.body.toString('utf8', offset, offset + len);
              row[fields[i]] = value;
              offset += len;
            }
          }
          rows.push(row as T);
        } else if (msg.type === 'E') throw parseError(msg.body);
        else if (msg.type === 'Z') return rows;
      }
    };
    const next = this.queryQueue.then(run, run);
    this.queryQueue = next.catch(() => undefined);
    return next;
  }
}

let singleton: PostgresClient | null = null;
export function getDb() {
  singleton ||= new PostgresClient();
  return singleton;
}
