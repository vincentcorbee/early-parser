import addToChart from "./add-to-chart"
import compare from "./compare"
import State from "../State"

const scan = (chart, token = { }, state, index) => {
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
      const newState = new State({
        lhs: state.lhs,
        left: [...state.left, rhs],
        dot: state.dot + 1,
        right: state.right.slice(1),
        from: state.from,
        action: state.action,
      })
      const changes = addToChart(chart, index + 1, newState)

      if (changes) {
        newState.previous = [state]
        state.token = tokenValue
        state.tokenMeta = token
      }

      return changes
    }

    return false
  } else {
    return false
  }
}

export default scan