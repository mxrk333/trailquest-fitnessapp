export const sanitizeData = <T extends Record<string, unknown>>(data: T): T => {
  const sanitized = { ...data }
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined) {
      delete sanitized[key]
    }
  })
  return sanitized
}
