export const createArray = (size: number): string[] => [...new Array(size).join(' ').split(' ')];

// tslint:disable-next-line: no-any
export const updateArrayLength = (size: number, array: Array<any>): Array<any> => {
  if (size > array.length) {
    return array.concat(createArray(size - array.length));
  } else if (size < array.length) {
    const newArray = [...array];
    newArray.length = size;
    return newArray;
  }
  return array;
};
