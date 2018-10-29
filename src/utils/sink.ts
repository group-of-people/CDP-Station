const floatRE = new RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");

export function isValidFloatInputNumber(value: string) {
  if (value === "" || floatRE.test(value)) return true;
  return false;
}

export function parseInputFloat(value: string) {
  return value === "" ? 0 : isNaN(parseFloat(value)) ? 0 : parseFloat(value);
}
