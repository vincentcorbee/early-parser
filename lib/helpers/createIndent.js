export const createIndent = index => {
  let cur = 0
  let str = ''
  while (cur <= index) {
    cur += 1
    str += '-'
  }
  return str
}
