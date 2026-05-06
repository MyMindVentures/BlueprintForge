export type ErrorTranslationKey = `errors.${string}`;
export type TranslateFn = (key: string, options?: Record<string, string | number | boolean | null | undefined>) => string;

const DEFAULT_ERROR_KEY: ErrorTranslationKey = 'errors.generic';

const HTTP_STATUS_ERROR_KEYS: Record<number, ErrorTranslationKey> = {
  400: 'errors.requestFailed',
  401: 'errors.openRouterInvalidKey',
  402: 'errors.openRouterNoCredits',
  403: 'errors.accessDenied',
  404: 'errors.notFound',
  422: 'errors.requestFailed',
  429: 'errors.openRouterRateLimited',
  500: 'errors.serviceUnavailable',
  502: 'errors.serviceUnavailable',
  503: 'errors.serviceUnavailable',
  504: 'errors.serviceUnavailable'
};

const CODE_ERROR_KEYS: Record<string, ErrorTranslationKey> = {
  API_KEY_MISSING: 'errors.openRouterKeyMissing',
  OPENROUTER_API_KEY_MISSING: 'errors.openRouterKeyMissing',
  OPENROUTER_API_KEY_INVALID: 'errors.openRouterInvalidKey',
  OPENROUTER_NO_CREDITS: 'errors.openRouterNoCredits',
  OPENROUTER_RATE_LIMITED: 'errors.openRouterRateLimited',
  OPENROUTER_SERVICE_ERROR: 'errors.serviceUnavailable',
  OPENROUTER_EMPTY_RESPONSE: 'errors.openRouterEmptyResponse',
  OPENROUTER_MODEL_UNAVAILABLE: 'errors.openRouterModelUnavailable',
  OPENROUTER_MANIFEST_INVALID: 'errors.openRouterManifestInvalid',
  GITHUB_CONFIG_MISSING: 'errors.githubConfigMissing',
  GITHUB_UNAUTHORIZED: 'errors.githubUnauthorized',
  GITHUB_FORBIDDEN: 'errors.githubForbidden',
  GITHUB_NOT_FOUND: 'errors.githubNotFound',
  GITHUB_RATE_LIMITED: 'errors.githubRateLimited',
  GITHUB_VALIDATION_FAILED: 'errors.githubValidationFailed',
  GITHUB_ISSUE_CREATE_FAILED: 'errors.githubIssueCreateFailed',
  BUILD_FEED_FOCUS_LIMIT: 'errors.focusLimit',
  RAW_CONCEPT_REQUIRED: 'errors.rawConceptRequired',
  PIPELINE_FAILED: 'errors.pipelineFailed',
  SYNC_FAILED: 'errors.syncFailed',
  DIAGNOSTICS_FAILED: 'errors.diagnosticsFailed',
  REQUEST_FAILED: 'errors.requestFailed',
  NOT_FOUND: 'errors.notFound'
};

const MESSAGE_PATTERNS: Array<[RegExp, ErrorTranslationKey]> = [
  [/^errors\./i, DEFAULT_ERROR_KEY],
  [/api key (is )?missing|missing openrouter|openrouter api key is missing|config missing/i, 'errors.openRouterKeyMissing'],
  [/api key appears invalid|invalid api key|401|unauthori[sz]ed/i, 'errors.openRouterInvalidKey'],
  [/no credits|payment required|402/i, 'errors.openRouterNoCredits'],
  [/rate limited|too many requests|429/i, 'errors.openRouterRateLimited'],
  [/service error|server error|5xx|\b50[0-9]\b|unavailable/i, 'errors.serviceUnavailable'],
  [/empty response/i, 'errors.openRouterEmptyResponse'],
  [/no endpoints found|model.*unavailable/i, 'errors.openRouterModelUnavailable'],
  [/manifest validation failed|invalid or empty model set/i, 'errors.openRouterManifestInvalid'],
  [/missing github configuration/i, 'errors.githubConfigMissing'],
  [/github api error:\s*401|bad credentials/i, 'errors.githubUnauthorized'],
  [/github api error:\s*403|resource not accessible/i, 'errors.githubForbidden'],
  [/github api error:\s*404|not found/i, 'errors.githubNotFound'],
  [/github api error:\s*422|validation failed/i, 'errors.githubValidationFailed'],
  [/github.*rate limit|secondary rate limit/i, 'errors.githubRateLimited'],
  [/github issue creation failed/i, 'errors.githubIssueCreateFailed'],
  [/maximum 3 focus requests/i, 'errors.focusLimit'],
  [/raw concept|app concept required/i, 'errors.rawConceptRequired'],
  [/api request failed/i, 'errors.requestFailed']
];

export class SafeError extends Error {
  code?: string;
  status?: number | null;
  translationKey: ErrorTranslationKey;
  backendMessage?: string;

  constructor(translationKey: ErrorTranslationKey, options: { code?: string; status?: number | null; backendMessage?: string; cause?: unknown } = {}) {
    super(translationKey);
    this.name = 'SafeError';
    this.translationKey = translationKey;
    this.code = options.code;
    this.status = options.status;
    this.backendMessage = options.backendMessage;
    this.cause = options.cause;
  }
}

export function getErrorStatus(error: unknown): number | null {
  if (error && typeof error === 'object') {
    const status = (error as any).status ?? (error as any).statusCode ?? (error as any).response?.status;
    if (typeof status === 'number') return status;
  }

  const message = getRawErrorMessage(error);
  const match = message.match(/\b(4\d{2}|5\d{2})\b/);
  return match ? Number(match[1]) : null;
}

export function getErrorTranslationKey(error: unknown, fallbackKey: ErrorTranslationKey = DEFAULT_ERROR_KEY): ErrorTranslationKey {
  if (error && typeof error === 'object') {
    const translationKey = (error as any).translationKey;
    if (isErrorTranslationKey(translationKey)) return translationKey;

    const key = (error as any).key;
    if (isErrorTranslationKey(key)) return key;

    const code = String((error as any).code || '').toUpperCase();
    if (CODE_ERROR_KEYS[code]) return CODE_ERROR_KEYS[code];
  }

  const status = getErrorStatus(error);
  if (status && HTTP_STATUS_ERROR_KEYS[status]) return HTTP_STATUS_ERROR_KEYS[status];
  if (status && status >= 500) return 'errors.serviceUnavailable';

  const message = getRawErrorMessage(error);
  if (isErrorTranslationKey(message)) return message;
  for (const [pattern, key] of MESSAGE_PATTERNS) {
    if (pattern.test(message)) return key === DEFAULT_ERROR_KEY && isErrorTranslationKey(message) ? message : key;
  }

  return fallbackKey;
}

export function getErrorMessage(error: unknown, t: TranslateFn, fallbackKey: ErrorTranslationKey = DEFAULT_ERROR_KEY): string {
  const key = getErrorTranslationKey(error, fallbackKey);
  return t(key);
}

export function toSafeError(error: unknown, fallbackKey: ErrorTranslationKey = DEFAULT_ERROR_KEY, options: { code?: string; status?: number | null } = {}): SafeError {
  const status = options.status ?? getErrorStatus(error);
  const translationKey = getErrorTranslationKey(error, fallbackKey);
  return new SafeError(translationKey, {
    code: options.code,
    status,
    backendMessage: getRawErrorMessage(error),
    cause: error
  });
}

export function createSafeError(code: string, options: { status?: number | null; backendMessage?: string; fallbackKey?: ErrorTranslationKey; cause?: unknown } = {}) {
  return new SafeError(CODE_ERROR_KEYS[code] || options.fallbackKey || DEFAULT_ERROR_KEY, {
    code,
    status: options.status,
    backendMessage: options.backendMessage,
    cause: options.cause
  });
}

function isErrorTranslationKey(value: unknown): value is ErrorTranslationKey {
  return typeof value === 'string' && value.startsWith('errors.');
}

function getRawErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const message = (error as any).message || (error as any).error || (error as any).backendMessage;
    return typeof message === 'string' ? message : '';
  }
  return '';
}
