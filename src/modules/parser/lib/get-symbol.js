import { getNonTerminal } from './get-non-terminal'
import { EMPTY } from '../../../constants/constants'

export const getSymbol = p => {
  const charClass = /^\[[^\]]+][*|+]?/
  const string = /^((?:"(?:[^"\\]|(?:\\.))*")|'(?:[^'\\]|(?:\\.))*')/

  return p
    ? p === EMPTY
      ? []
      : [charClass.test(p) ? [new RegExp(p)] : string.test(p) ? [p] : getNonTerminal(p)]
    : []
}
