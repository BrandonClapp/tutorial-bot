export function isEmptyOrSpaces(str) {
  return str === null || str === undefined || str.match(/^ *$/) !== null;
}
