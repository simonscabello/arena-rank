export function isUniqueConstraintError(error: unknown) {
  if (!error || typeof error !== 'object') return false

  const code = 'code' in error ? String(error.code) : ''
  const errno = 'errno' in error ? Number(error.errno) : null

  return code === 'SQLITE_CONSTRAINT_UNIQUE' || code === 'ER_DUP_ENTRY' || errno === 1062
}
