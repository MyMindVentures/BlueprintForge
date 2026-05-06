import { getDb, sqlValue } from '../db/postgres';
export const notificationRepository = {
  list: (userId: string) => getDb().query(`SELECT id::text, user_id, type, title, message, link, is_read, created_at FROM notifications WHERE user_id=${sqlValue(userId)} ORDER BY created_at DESC`),
  markRead: (id: string, userId: string) => getDb().query(`UPDATE notifications SET is_read=TRUE, updated_at=now() WHERE id=${sqlValue(id)} AND user_id=${sqlValue(userId)}`),
  create: (n: any) => getDb().query(`INSERT INTO notifications (user_id,type,title,message,link,is_read) VALUES (${sqlValue(n.user_id)},${sqlValue(n.type || 'general')},${sqlValue(n.title)},${sqlValue(n.message)},${sqlValue(n.link)},${sqlValue(!!n.is_read)})`)
};
