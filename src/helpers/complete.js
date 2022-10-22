import addToChart from './add-to-chart'

const transitiveItems = {}

const complete = (chart, state, index, grammar) => {
  const transitiveItem = transitiveItems[state.getTransitiveKey()]

  if (transitiveItem) {
    const newState = addToChart(chart, index, {
      lhs: transitiveItem.lhs,
      left: transitiveItem.left,
      right: transitiveItem.right,
      dot: transitiveItem.dot,
      from: transitiveItem.from,
      action: transitiveItem.action,
    })

    if (newState) newState.previous = [...state.previous, state]

    return
  }

  if (state.hasRightRecursion(grammar)) {
    const fromStates = chart[state.from].filter(fromState => {
      const { right, left, lhs } = fromState

      if (
        lhs === state.lhs &&
        left.join(' ') === state.left.slice(0, -1).join(' ') &&
        right[0] === state.lhs
      )
        return true

      return false
    })

    if (fromStates.length === 1) {
      const { right, left, dot, lhs, from, action, previous } = fromStates[0]

      const newState = addToChart(chart, index, {
        lhs,
        left: [...left, right[0]],
        right: right.slice(1) || [],
        dot: dot + 1,
        from,
        action,
      })

      if (newState) {
        newState.previous = [...previous, state]

        transitiveItems[newState.getTransitiveKey()] = newState
      }
    }
  }

  chart[state.from].forEach(fromState => {
    const {
      right: fromRight,
      left: fromLeft,
      dot,
      lhs,
      from,
      action,
      previous,
    } = fromState

    if (fromRight.length && fromRight[0] === state.lhs) {
      const newState = addToChart(chart, index, {
        lhs,
        left: [...fromLeft, fromRight[0]],
        right: fromRight.slice(1) || [],
        dot: dot + 1,
        from,
        action,
      })

      if (newState) newState.previous = [...previous, state]
    }
  })
}

export default complete
