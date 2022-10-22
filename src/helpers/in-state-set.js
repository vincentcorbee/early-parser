const inStateSet = (stateSet, state) =>
  stateSet.keys[`${state.lhs}${state.right.join('')}${state.left.join('')}${state.from}`]
// stateSet.some(
//   ({ lhs, right, left, from }) =>
//     lhs === state.lhs &&
//     right.join(' ') === state.right.join(' ') &&
//     left.join(' ') === state.left.join(' ') &&
//     from === state.from
// )

export default inStateSet
