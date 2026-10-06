// BLOCKED CALLERS
// Purpose: Maintains the list of phone numbers that should not enter the IVR.

const BLOCKED_NUMBERS = [
  "14243449637",
  "18185782266",
  "19493892897"
];

export function isBlocked(number) {
  return BLOCKED_NUMBERS.includes(number);
}
