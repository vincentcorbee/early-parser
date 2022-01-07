import { EMPTY } from './constants/constants'
import { predict, scan, complete, createAST, getFinishedState, createParseTree } from './helpers'
import State from './State'

const _private = new WeakMap()

class Parser {
  constructor(lexer) {
    this.started = false
    this.index = 0
    this.lexer = lexer

    _private.set(this, {
      grammer: [],
      actions: [],
      cache: {},
      chart: []
    })
  }

  resumeParse() {
    const { grammer, chart } = _private.get(this)
    const [start_rule] = grammer
    const rhss = start_rule.rhs
    const lexer = this.lexer

    let prevToken = null
    let token = null
    let index = this.index

    if (!this.started) {
      chart[0] = rhss.map(
        rhs =>
          new State({
            lhs: start_rule.lhs,
            left: [],
            right: rhs,
            dot: 0,
            from: 0,
            action: start_rule.action,
          })
      )
    }

    this.started = true

    while (index <= chart.length) {
      prevToken = token || prevToken

      token = lexer.readToken()

      let changes = 1

      while (changes && chart[index]) {
        changes = 0

        const states = chart[index]

        for (const state of states) {
          // if (!token) {
          //   if (state.complete) {
          //     changes |= complete(chart, state, index)
          //   }
          // } else {
            if (state.complete) {
              changes |= complete(chart, state, index)
            } else if (state.expectNonTerminal(grammer)) {
              changes |= predict(chart, grammer, state.right, index)
            } else {
              changes |= scan(chart, token || undefined, state, index)
            }
          // }
        }

        if (!changes) {
          break
        }
      }

      index += 1

      this.index = index
    }

    if (token) {
      return this.error({
        prevToken,
        token,
        chart,
      })
    }

    const finishedState = getFinishedState(chart, start_rule)

    if (finishedState.length) {
      return finishedState
    }

    return this.error({
      token: null,
      prevToken,
      chart,
    })
  }

  error(err) {
    const { prevToken } = err

    if (prevToken) {
      throw SyntaxError(
        `Parsing Error (line: ${prevToken.line}, col: ${prevToken.col}) of input stream`
      )
    }

    throw Error('Unknown parsing error')
  }

  // In case of ambiguity, a seperate tree is created for each posible finished grammer start rule
  // Four types of node for the parse tree
  // 1. Symbol node i.e. completed grammer rule
  // 2. Intermediate node i.e. completed production rule
  // 3. Terminal node i.e. a leaf
  // 4. Nodes i.e. represent the ambiguitiy - this is represented as seperate tree

  parse(cb) {
    const cache = _private.get(this).cache[this.lexer.source]

    if (cache) {
      return cb(cache)
    }

    const state = this.resumeParse()

    if (state && state.length) {
      const { chart } = _private.get(this)
      // It is more efficient to create an ast directly instead of a parseTree first
      const parseTree = state.map(state => createParseTree(state))
      const AST = parseTree.map(parseTree => createAST(parseTree))

      this.index = 0
      this.started = false

      _private.get(this).cache[this.lexer.source] = {
        AST,
        parseTree,
        chart
      }

      _private.get(this).chart = []

      this.lexer.reset()

      return cb({ chart, AST, parseTree })
    } else {
      this.error({
        chart: _private.get(this).chart
      })
    }
  }

  grammer(list) {
    const charClass = /\[[^\]]+][*|+]?/
    const { grammer } = _private.get(this)

    list.forEach(({ exp, action }) => {
      const match = exp.match(/[a-zA-Z]+ :/)
      // The splitting of the rhs does not work correctly when there are regexes with a | in it
      if (match) {
        const lhs = match[0].slice(0, -2)
        const rhs = exp.replace(lhs, '').trim().slice(2)

        if (grammer.every(rule => rule.lhs !== lhs)) {
          grammer.push({
            action,
            lhs,
            rhs: rhs.split(/^\|\s+|\s+\|\s+/g).map(part =>
              part
                .trim()
                .split(' ')
                .flatMap(p => p ? p === EMPTY ? [] : [(charClass.test(p) ? new RegExp(p) : p)] : [])
            ),
          })
        }
      } else {
        throw new Error(`Incorrect grammer rule: ${exp}`)
      }
    })
  }

  reset() {
    this.index = 0
    this.started = false

    _private.get(this).chart = []

    this.lexer.reset()
  }
}

export default Parser
