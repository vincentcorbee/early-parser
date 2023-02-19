import { EMPTY } from '../src/constants/constants'

const grammar = [
  // {
  //   exp: `expression :
  //     number
  //   | expression + expression
  //   | expression - expression
  //   | ( expression )`,
  // },
  // {
  //   exp: 'number : 1 | 2',
  // },
  {
    exp: `A :
      A a
    | ${EMPTY}`,
  },
  // {
  //   exp: 'A : x B | x',
  // },
  // {
  //   exp: 'B : y A',
  // },
]

export default grammar
