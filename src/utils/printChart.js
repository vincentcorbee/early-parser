import { createNewElement, append } from '../helpers'

export const printChart = (chart, target = document.body, completed = false) => {
  const table = createNewElement('div', ['class=table'])
  const tableBody = createNewElement('div', ['class=body flex'])
  const docFrag = createNewElement('documentFragment')

  chart.forEach((stateSet, i) => {
    const col = createNewElement('div', ['class=col'])

    append(tableBody, append(col, createNewElement('div', ['class=row', `content=${i}`])))

    stateSet.forEach(state => {
      const row = createNewElement('div', ['class=row'])
      append(col, row)

      if (!completed || (completed && state.complete)) {
        row.innerHTML = `${state.lhs} → ${state.left.join(
          ' '
        )} <span class='dot'>•</span> ${state.right.join(' ')} \t\t from (${state.from})`
      }
    })
  })

  append(target, append(docFrag, append(table, tableBody)))
}
