/**
 * Flatten array
 */
export const flattenArray = <T>(input: Array<Array<T>>): Array<T> => {
  return ([] as Array<T>).concat(...input);
};
