export function success<T>(data: T) {
  return { data }
}

export function fail(code: string, message: string) {
  return { error: { code, message } }
}

export function forbidden(message: string = 'Forbidden') {
  return { error: { code: 'FORBIDDEN', message } }
}

export function badRequest(message: string = 'Bad Request') {
  return { error: { code: 'BAD_REQUEST', message } }
}

export function unauthorized(message: string = 'Unauthorized') {
  return { error: { code: 'UNAUTHORIZED', message } }
}
