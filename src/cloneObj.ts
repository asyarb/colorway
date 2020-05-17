/**
 * Utility for deeply cloning an object. Since it relies on
 * serialization, non serializeable values will be lost.
 *
 * @param obj The object to deeply clone.
 *
 * @returns A new object that is a deep clone of `obj`.
 */
export const cloneObj = <T extends object>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj)) as T
}
