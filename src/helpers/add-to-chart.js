import inStateSet from "./in-state-set"

const addToChart = (chart, index, state) => {
  let stateSet = chart[index]

  if (!stateSet) {
    stateSet = []

    chart[index] = stateSet
  }

  const inSet = inStateSet(stateSet, state)

  if (!inSet) {
    stateSet.push(state)
  }

  return !inSet
}

export default addToChart