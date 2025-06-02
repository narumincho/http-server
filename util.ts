/**
 * Compares two arrays of strings for equality.
 *
 * @example
 * stringArrayEqual([], []) === true
 * stringArrayEqual(["a", "b"], ["a", "b"]) === true
 * stringArrayEqual(["a", "b"], ["a", "c"]) === false
 * stringArrayEqual(["a", "b"], ["a", "b", "c"]) === false
 * stringArrayEqual(["a", "b", "c"], ["a", "b"]) === false
 */
export const stringArrayEqual = (
  a: ReadonlyArray<string>,
  b: ReadonlyArray<string>,
) => {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};

/**
 * Compares two arrays of strings for starting sequence equality.
 *
 * @example
 * stringArrayStartWith([], []) === true
 * stringArrayStartWith(["a", "b"], ["a"]) === true
 * stringArrayStartWith(["a", "b"], ["a", "b"]) === true
 * stringArrayStartWith(["a", "b"], ["a", "c"]) === false
 * stringArrayStartWith(["a", "b"], ["a", "b", "c"]) === false
 * stringArrayStartWith(["a", "b", "c"], ["a", "b"]) === true
 */
export const stringArrayStartWith = (
  a: ReadonlyArray<string>,
  b: ReadonlyArray<string>,
) => {
  if (a.length < b.length) {
    return false;
  }
  for (let i = 0; i < b.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};
