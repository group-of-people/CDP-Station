const floatRE = new RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");

export function isValidFloatInputNumber(value) {
  if (value === "" || floatRE.test(value)) return true;
  return false;
}

export function parseInputFloat(value) {
  return value === "" ? 0 : parseFloat(value) === NaN ? 0 : parseFloat(value);
}
