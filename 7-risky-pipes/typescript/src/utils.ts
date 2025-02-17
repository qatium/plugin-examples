export const yearsToMilis = (years: number) => years * 365 * 24 * 60 * 60 * 1000;

export const isValidNumber = (value: number) => {
  if (Number.isNaN(value)) return false
  return value >= 0
}