export const inStateSet = (stateSet, state) =>
  stateSet.keys[`${state.lhs}${state.right.join('')}${state.left.join('')}${state.from}`]
