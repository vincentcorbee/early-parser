import {
  predict,
  scan,
  complete,
  createAST,
  getFinishedState,
  createParseTree,
  getSymbol,
} from './lib'
import { StateSet } from '../state-set'

const _private = new WeakMap()

export class Parser {
  constructor(lexer) {
    this.started = false
    this.index = 0
    this.lexer = lexer
    this.cacheLength = 0

    _private.set(this, {
      grammar: {},
      startRule: null,
      cache: {},
      chart: [],
    })
  }

  resumeParse() {
    performance.mark('s')
    const { grammar, chart, startRule } = _private.get(this)
    const start_rule = grammar[startRule]
    const rhss = start_rule.rhs
    const lexer = this.lexer

    let prevToken = null
    let token = null
    let index = this.index

    if (!this.started) {
      const stateSet = new StateSet()

      rhss.forEach(rhs => {
        stateSet.add({
          lhs: start_rule.lhs,
          left: [],
          right: rhs,
          dot: 0,
          from: 0,
          action: start_rule.action,
        })
      })

      chart[0] = stateSet
    }

    this.started = true

    console.time()

    while (chart[index]) {
      prevToken = token || prevToken

      token = lexer.readToken()

      const states = chart[index]

      for (const state of states) {
        if (state.expectNonTerminal(grammar)) {
          predict(chart, grammar, state, index)
        } else if (state.expectTerminal(grammar)) {
          scan(chart, token || undefined, state, index)
        } else if (state.complete) {
          complete(chart, state, index, grammar)
        } else {
          throw Error('Illegal rule')
        }
      }

      this.index = index++
    }

    if (token)
      return this.error({
        prevToken,
        token,
        chart,
      })

    const finishedState = getFinishedState(chart, start_rule)

    console.timeEnd()

    performance.mark('e')

    performance.measure('p', 's', 'e')

    // console.log(performance.getEntriesByName('p')[0].duration)

    if (finishedState.length) return finishedState

    return this.error({
      token: null,
      prevToken,
      chart,
    })
  }

  error(err) {
    const { prevToken } = err

    if (prevToken)
      throw SyntaxError(
        `Parsing Error token: ${prevToken.value} (line: ${prevToken.line}, col: ${prevToken.col}) of input stream`
      )

    throw Error('Unknown parsing error')
  }

  // In case of ambiguity, a seperate tree is created for each posible finished grammar start rule
  // Four types of node for the parse tree
  // 1. Symbol node i.e. completed grammar rule
  // 2. Intermediate node i.e. completed production rule
  // 3. Terminal node i.e. a leaf
  // 4. Nodes i.e. represent the ambiguitiy - this is represented as seperate tree

  parse(cb) {
    performance.mark('start')

    const cache = _private.get(this).cache[this.lexer.source]

    // console.log(this.lexer.source)

    if (cache) return cb(cache)

    const state = this.resumeParse()

    if (state && state.length) {
      const { chart } = _private.get(this)

      // It is more efficient to create an ast directly instead of a parseTree first
      const parseTree = state.map(state => createParseTree(state))

      const AST = parseTree.flatMap(parseTree => createAST(parseTree))

      this.index = 0
      this.started = false

      performance.mark('end')

      performance.measure('parse', 'start', 'end')

      const time = performance.getEntriesByName('parse')[0].duration

      performance.clearMarks()
      performance.clearMeasures()

      _private.get(this).cache[this.lexer.source] = {
        AST,
        parseTree,
        chart,
        time: 0,
      }

      this.cacheLength++

      // console.log(this.lexer.source)

      _private.get(this).chart = []

      return cb({ chart, AST, parseTree, time })
    } else {
      this.error({
        chart: _private.get(this).chart,
      })
    }
  }

  grammer(list) {
    const { grammar } = _private.get(this)

    list.forEach(({ exp, action }) => {
      const match = exp.match(/([a-zA-Z_]+)(\[[a-zA-Z, _]+\])? *(?=:)/)

      // The splitting of the rhs does not work correctly when there are regexes with a | in it
      if (match) {
        const lhs = match[1]
        const parameters = match[2] || ''

        if (!grammar[lhs]) {
          const rhs = exp
            .replace(`${lhs}${parameters}`, '')
            .replace(/^\s*:\s*/, '')
            .split(/^\|\s+|\s+\|\s+/g)
            .reduce((acc, expression) => {
              /*
                Expand optional symbols into extra right hand sides
              */
              const symbols = expression.split(' ').flatMap(getSymbol)

              let hasOpt = false

              symbols.forEach((symbol, i) => {
                const [, , opt] = symbol

                if (opt) {
                  acc.push([...symbols])

                  symbols.splice(i, 1)

                  acc.push([...symbols])

                  hasOpt = true
                }
              })

              if (!hasOpt) acc.push(symbols)

              return acc
            }, [])

          const params = [
            lhs,
            ...(parameters
              ? parameters
                  .replace(/\[|\]/g, '')
                  .trim()
                  .split(/\s*,\s*/)
              : []),
          ]

          if (!_private.get(this).startRule) _private.get(this).startRule = lhs

          while (params.length) {
            const key = params.join('_')

            let raw = `${lhs} : `

            const rhsArray = rhs.map(part =>
              part.flatMap(([v, p = []]) =>
                p.reduce((acc, cur) => {
                  if (cur.mod === '?')
                    return (acc += params.includes(cur.value) ? `_${cur.value}` : '')

                  return (acc += `_${cur.value}`)
                }, v)
              )
            )

            rhsArray.forEach(
              (part, i) =>
                (raw += `${part.join(' ')}${rhsArray[i + i] === undefined ? '' : ' | '}`)
            )

            const production = {
              action,
              lhs: key,
              raw,
              rhs: rhsArray,
            }

            grammar[key] = production

            params.pop()
          }
        }
      } else throw new Error(`Incorrect grammar rule: ${exp}`)
    })
  }

  reset() {
    this.index = 0
    this.started = false

    _private.get(this).chart = []

    this.lexer.reset()
  }
}
