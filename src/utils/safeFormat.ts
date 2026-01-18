// Safe Formatting Utilities - Prevents undefined/null errors

/**
 * Safely format a number as locale string
 * Returns "0" if value is undefined, null, or NaN
 */
export const safeToLocaleString = (
  value: number | undefined | null
): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return "0";
  }
  return value.toLocaleString();
};

/**
 * Safely get a number value with fallback
 */
export const safeNumber = (
  value: number | undefined | null,
  fallback: number = 0
): number => {
  if (value === undefined || value === null || isNaN(value)) {
    return fallback;
  }
  return value;
};

/**
 * Safely calculate product of two numbers
 */
export const safeMultiply = (
  a: number | undefined | null,
  b: number | undefined | null
): number => {
  const numA = safeNumber(a);
  const numB = safeNumber(b);
  return numA * numB;
};

/**
 * Safely format currency with NPR symbol
 */
export const formatNPR = (value: number | undefined | null): string => {
  return `NPR ${safeToLocaleString(value)}`;
};

/**
 * Safely format currency with Rs symbol
 */
export const formatINR = (value: number | undefined | null): string => {
  return `Rs${safeToLocaleString(value)}`;
};
