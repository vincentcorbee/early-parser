import State from "../State"
import addToChart from "./add-to-chart"

const predict = (chart, grammer, right, from) => {
  const rule = grammer.find(({ lhs }) => right.length && right[0] === lhs)

  if (rule) {
    const { action, rhs, lhs } = rule

    return rhs.some(right =>
      addToChart(
        chart,
        from,
        new State(
          {
            lhs,
            left: [],
            right,
            dot: 0,
            from,
            action,
          },
          rule
        )
      )
    )
  }

  return false
}

export default predict