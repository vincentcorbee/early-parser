export const getFinishedState = (chart, start_rule) => {
  // return chart[chart.length - 1].has(chart[0].states[0])
  return chart[chart.length - 1].filter(
    state => state.complete && state.from === 0 && state.lhs === start_rule.lhs
  )
}
