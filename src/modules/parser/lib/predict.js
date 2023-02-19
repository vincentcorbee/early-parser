import { addToChart } from './add-to-chart'

export const predict = (chart, grammer, state, from) => {
  const rule = state.nextNonTerminal

  if (rule) {
    const { action, rhs, lhs } = rule

    rhs.forEach(right =>
      addToChart(
        chart,
        from,
        {
          lhs,
          left: [],
          right,
          dot: 0,
          from,
          action,
        },
        rule,
        grammer
      )
    )
  }
}
