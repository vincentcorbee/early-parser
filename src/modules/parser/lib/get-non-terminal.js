export const getNonTerminal = input => {
  const match = input.match(/([a-zA-Z_]+)(\[[a-zA-Z, _?]+\])?(\?)?/)

  if (!match) return [input]

  const [, nonTerminal, parameters = '', opt] = match

  const params = parameters
    ? parameters
        .replace(/\[|\]/g, '')
        .split(',')
        .map(param => {
          if (param.includes('?'))
            return {
              value: param.replace('?', '').trim(),
              mod: '?',
            }

          return { value: param.trim() }
        })
    : []

  return [nonTerminal, params, !!opt]
}
