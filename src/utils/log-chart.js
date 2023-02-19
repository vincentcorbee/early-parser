export const logChart = (chart = [], completed = false) =>
  chart.forEach((stateSet, i) => {
    console.log(`==== ${i} ====`)

    stateSet.forEach(state => {
      if (!completed || (completed && state.complete)) {
        console.log(
          `${state.lhs} -> ${state.left.join(' ')} • ${state.right.join(
            ' '
          )} \t\t from (${state.from})`
        )
      }
    })
  })
