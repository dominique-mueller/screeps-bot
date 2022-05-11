/**
 * Flatten array
 *
 * Note:
 * Essentially "polyfilled" because Screeps uses an older Node.js version which does not yet support "Array.flat()"
 */
export const flattenArray = <T>(input: Array<Array<T>>): Array<T> => {
  return ([] as Array<T>).concat(...input);
};
