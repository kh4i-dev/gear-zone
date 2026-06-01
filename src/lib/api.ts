export type ApiMeta = {
  traceId: string
  timestamp: string
  [key: string]: unknown
}

export function createTraceId() {
  return globalThis.crypto?.randomUUID?.() ?? `trace_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function withMeta(meta?: Partial<ApiMeta>): ApiMeta {
  return {
    traceId: meta?.traceId ?? createTraceId(),
    timestamp: meta?.timestamp ?? new Date().toISOString(),
    ...meta,
  }
}

export function success<T>(data: T, meta?: Partial<ApiMeta>) {
  return { data, error: null, meta: withMeta(meta) }
}

export function fail(code: string, message: string, meta?: Partial<ApiMeta>) {
  return { data: null, error: { code, message }, meta: withMeta(meta) }
}

export function forbidden(message: string = 'Forbidden', meta?: Partial<ApiMeta>) {
  return fail('FORBIDDEN', message, meta)
}

export function badRequest(message: string = 'Bad Request', meta?: Partial<ApiMeta>) {
  return fail('BAD_REQUEST', message, meta)
}

export function unauthorized(message: string = 'Unauthorized', meta?: Partial<ApiMeta>) {
  return fail('UNAUTHORIZED', message, meta)
}

export function logServerError(context: string, error: unknown, traceId: string) {
  const err = error instanceof Error
    ? { name: error.name, message: error.message, stack: error.stack }
    : { message: String(error) }

  console.error(JSON.stringify({
    level: 'error',
    context,
    traceId,
    error: err,
    timestamp: new Date().toISOString(),
  }))
}
