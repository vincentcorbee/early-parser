import State from "../State"
import addToChart from "./add-to-chart"

const complete = (chart, state, index) =>
  chart[state.from].some(fromState => {
    const { right, left, dot, lhs, from, action } = fromState

    if (!state.right.length && right.length && right[0] === state.lhs) {
      const newState = new State({
        lhs,
        left: [...left, right[0]],
        right: right.slice(1) || [],
        dot: dot + 1,
        from,
        action,
      })

      const changes = addToChart(chart, index, newState)

      if (changes) {
        newState.previous = [...fromState.previous, state]
      }

      return changes
    }

    return false
  })

export default complete