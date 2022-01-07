const getFinishedState = (chart, start_rule) =>
  chart[chart.length - 1].filter(
    state => state.complete && state.from === 0 && state.lhs === start_rule.lhs
  )

export default getFinishedState