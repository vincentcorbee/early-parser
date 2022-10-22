const flattenList = (arr, excludeNull = false) =>
  arr.flatMap(val =>
    Array.isArray(val) && !val.type
      ? flattenList(val)
      : val === null && excludeNull
      ? []
      : [val]
  )

export default flattenList
