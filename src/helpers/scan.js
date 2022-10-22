import addToChart from './add-to-chart'
import compare from './compare'

const scan = (chart, token = {}, state, index) => {
  if (state.right.length) {
    const { type, value: tokenValue } = token
    const [rhs] = state.right
    const value = rhs === type ? type : tokenValue
    const right =
      typeof rhs === 'object' || rhs === type
        ? rhs
        : rhs.indexOf('"') === 0
        ? rhs.slice(1, -1)
        : rhs

    if (compare(value, right)) {
      const { lhs, left, dot, from, action } = state
      const newState = addToChart(chart, index + 1, {
        lhs,
        left: [...left, rhs],
        dot: dot + 1,
        right: state.right.slice(1),
        from,
        action,
      })

      if (newState) {
        newState.previous = [state]

        state.token = tokenValue
        state.tokenMeta = token
      }
    }
  }
}

export default scan
