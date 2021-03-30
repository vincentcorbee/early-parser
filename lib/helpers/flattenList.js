export const flattenList = (arr, excludeNull = false) =>
  arr.reduce(
    (acc, val) =>
      Array.isArray(val) && !val.type ? [...acc, ...flattenList(val)] : val === null && excludeNull ? acc : [...acc, val],
    []
  )

export default flattenList
