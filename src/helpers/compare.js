const compare = (value, right) => {
  if (typeof right === 'object') {
    return right.test(value)
  }

  // This peforms a strict comparison on the value parsed and the value of the rhs
  return right === value
}

export default compare