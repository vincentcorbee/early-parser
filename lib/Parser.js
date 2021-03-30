import { flattenList } from './helpers'
import State from './State'
import { createParseTree } from './parser/'

// const time = new Time()

// Still have to implement nullable grammer rules

// previous.reverse().forEach(prev => createParseTree(prev, index + 1, parentNode, tree))
/* console.log(
    `${index} |${createIndent(index)}${prev.lhs} -> ${prev.left.join(
      ' '
    )} . ${prev.right.join(' ')} ${prev.token !== undefined ? prev.token : ''}`
  ) */

const _private = new WeakMap()

const map = node => {
  node = Array.isArray(node) ? node : [node]

  // Get type returned from the semantic action
  const type =
    node.length > 1 && typeof node[0] === 'string' ? node.splice(0, 1)[0] : null

  return node.map(child => {
    if (Array.isArray(child)) {
      child = child.map(mapNode)
    } else if (child !== undefined && child.type) {
      child = mapNode(child)
    } else if (child !== undefined) {
      child = [child]
    }

    // console.log(JSON.stringify(child, null, 2))

    if (child !== undefined && type) {
      child.type = type
    }

    return child
  })
}

const mapNode = node => {
  const action = node.action

  // Perform sematic action on node
  if (action && typeof action === 'function') {
    let list

    if (node.children) {
      list = action([node.type].concat(node.children))
    } else {
      list = action([node.type, node.value])
    }

    if (list === null) {
      return []
    }

    list = map(list)

    return Array.isArray(list) && !list.type ? flattenList(list, true) : list
  } else {
    return [node.value]
  }
}
const createAST = parseTree => parseTree.map(node => mapNode(node))

const compare = (value, right) => {
  if (typeof right === 'object') {
    return right.test(value)
  }

  // This peforms a strict comparison on the value parsed and the value of the rhs
  return right === value
}
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
const scan = (chart, { type, value: tokenValue }, state, index) => {
  if (state.right.length) {
    const rhs = state.right[0]
    const value = rhs === type ? type : tokenValue
    const right =
      typeof rhs === 'object' || rhs === type
        ? rhs
        : rhs.indexOf('"') === 0
        ? rhs.slice(1, -1)
        : rhs

    if (compare(value, right)) {
      const newState = new State({
        lhs: state.lhs,
        left: [...state.left, rhs],
        dot: state.dot + 1,
        right: state.right.slice(1),
        from: state.from,
        action: state.action,
      })
      const changes = addToChart(chart, index + 1, newState)

      if (changes) {
        newState.previous = [state]
        state.token = tokenValue
      }

      return changes
    }

    return false
  } else {
    return false
  }
}
const complete = (chart, state, index) =>
  chart[state.from].some(fromState => {
    const { right, left, dot, lhs, from, action } = fromState

    if (!state.right.length && right.length && right[0] === state.lhs) {
      const newState = new State({
        lhs,
        left: [...left, right[0]],
        right: right.slice(1) || [],
        dot: dot + 1,
        from,
        action,
      })

      const changes = addToChart(chart, index, newState)

      if (changes) {
        newState.previous = [...fromState.previous, state]
      }

      return changes
    }

    return false
  })
const inStateSet = (stateSet, state) =>
  stateSet.some(
    ({ lhs, right, left, from }) =>
      lhs === state.lhs &&
      right.join(' ') === state.right.join(' ') &&
      left.join(' ') === state.left.join(' ') &&
      from === state.from
  )
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
const getFinishedState = (chart, start_rule) =>
  chart[chart.length - 1].filter(
    state => state.complete && state.from === 0 && state.lhs === start_rule.lhs
  )

class Parser {
  constructor(lexer) {
    this.started = false
    this.index = 0
    this.lexer = lexer
    this.chart = []

    _private.set(this, {
      grammer: [],
      actions: [],
      cache: {},
    })
  }

  resumeParse() {
    const self = this
    const { grammer } = _private.get(self)
    const chart = self.chart
    const start_rule = grammer[0]
    const rhss = start_rule.rhs
    const lexer = self.lexer
    let prevToken = null
    let token = null
    let index = self.index

    if (!self.started) {
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

    self.started = true

    while (index <= chart.length) {
      prevToken = token || prevToken
      token = lexer.readToken()

      let changes = 1

      while (changes && chart[index]) {
        changes = 0

        const states = chart[index]

        for (const state of states) {
          if (!token) {
            if (state.complete) {
              changes |= complete(chart, state, index)
            }
          } else {
            if (state.complete) {
              changes |= complete(chart, state, index)
            } else if (state.expectNonTerminal(grammer)) {
              changes |= predict(chart, grammer, state.right, index)
            } else {
              changes |= scan(chart, token, state, index)
            }
          }
        }

        if (!changes) {
          break
        }
      }

      index += 1

      self.index = index
    }

    if (token) {
      return self.error({
        prevToken,
        token,
        chart,
      })
    }

    const finishedState = getFinishedState(chart, start_rule)

    if (finishedState.length) {
      return finishedState
    }

    return self.error({
      token: null,
      prevToken: null,
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
    const self = this
    const cache = _private.get(self).cache[self.lexer.source]

    if (cache) {
      self.parseTree = cache.parseTree
      self.AST = cache.AST

      return cb()
    }

    const state = self.resumeParse()

    console.log(state)

    if (state && state.length) {
      // It is more efficient to create an ast directly instead of a parseTree first
      self.parseTree = state.map(state => createParseTree(state))
      self.AST = self.parseTree.map(parseTree => createAST(parseTree))
      self.index = 0
      self.started = false

      cb()

      self.chart = []

      _private.get(self).cache[self.lexer.source] = {
        AST: self.AST,
        parseTree: self.parseTree,
      }

      self.lexer.reset()
    } else {
      self.error(state)
    }
  }

  grammer(list) {
    const self = this
    const charClass = /\[[^\]]+][*|+]?/
    let { grammer } = _private.get(self)

    list.forEach(obj => {
      let lhs = obj.exp.match(/[a-zA-Z]+ :/)
      // The splitting of the rhs does not work correctly when there are regexes with a | in it
      if (lhs) {
        lhs = lhs[0].slice(0, -2)

        const r = obj.exp.replace(lhs, '').trim().slice(2)

        if (grammer.every(rule => rule.lhs !== lhs)) {
          grammer.push({
            action: obj.action,
            lhs,
            rhs: r.split(/^\| +| +\| +/g).map(part =>
              part
                .trim()
                .split(' ')
                .map(p => (charClass.test(p) ? new RegExp(p) : p))
                .filter(p => p)
            ),
          })
        }
      } else {
        throw new Error(`Incorrect grammer rule: ${obj.exp}`)
      }
    })
  }
}

export default Parser
