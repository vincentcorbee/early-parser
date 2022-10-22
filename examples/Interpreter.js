import { flattenList } from './flattenList'

const unaryOperations = {
  '+': a => +a,
  '-': a => -a,
}
const assignOperations = {
  '=': (a, b, env) => env.set(a, b),
  '+=': (a, b, env) => env.set(a, env.get(a) + b),
  '-=': (a, b, env) => env.set(a, env.get(a) - b),
  '*=': (a, b, env) => env.set(a, env.get(a) * b),
  '/=': (a, b, env) => env.set(a, env.get(a) / b),
  '%=': (a, b, env) => env.set(a, env.get(a) - b),
  '<<=': (a, b, env) => env.set(a, env.get(a) << b),
  '>>=': (a, b, env) => env.set(a, env.get(a) >> b),
  '&=': (a, b, env) => env.set(a, env.get(a) & b),
  '^=': (a, b, env) => env.set(a, env.get(a) ^ b),
  '|=': (a, b, env) => env.set(a, env.get(a) | b),
}
const binaryOperations = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  '===': (a, b) => a === b,
  '==': (a, b) => a == b,
  '!==': (a, b) => a !== b,
  '!=': (a, b) => a != b,
  '&&': (a, b) => a && b,
  '||': (a, b) => a || b,
  '|': (a, b) => a | b,
  '&': (a, b) => a & b,
  '<': (a, b) => a < b,
  '>': (a, b) => a > b,
  '>=': (a, b) => a >= b,
  '<=': (a, b) => a <= b,
}

const getOperation = (op, type) => {
  switch (type) {
    case 'binary':
      return binaryOperations[op]
    case 'assign':
      return assignOperations[op]
    case 'unary':
      return unaryOperations[op]
  }
}

const mapFieldList = (arr, chunck = 2) => {
  const list = []

  while (arr.length) {
    list.push(arr.splice(0, chunck))
  }

  return list
}

const getCaller = (path, env) => {
  let caller

  caller = path.length ? env.get(path.shift()) : env.this
  path.forEach((p, i) => {
    if (caller.hasOwnProperty(p) || i === 0) {
      caller = output[p]
    } else {
      throw TypeError(`Cannot read property ${p}`)
    }
  })
  return caller
}
const mapProps = list => {
  let path = []

  const map = list => {
    list.forEach(node => {
      if (node[0].type === 'accessor') {
        mapProps(node[0])

        path.push(node[1][0])
      } else if (node.type === 'accessor') {
        mapProps(node)
      } else {
        path.push(node[0])
      }
    })
  }

  map(list)

  return path
}

const getPath = arr =>
  arr.reduce(
    (acc, val) =>
      Array.isArray(val) && (!val.type || val.type === 'accessor')
        ? acc.concat(getPath(val))
        : acc.concat([val]),
    []
  )

const evaluate = (tree, env = {}) =>
  tree
    .map(node => {
      const type = node.type

      if (type === 'tenary') {
        return evaluate(node[0], env)[0]
          ? evaluate(node[1], env)[0]
          : evaluate(node[2], env)[0]
      } else if (type === 'arrayLiteral') {
        return evaluate(node[0], env)
      } else if (type === 'objectLiteral') {
        const obj = {}
        const args = node[0] ? mapFieldList(flattenList(evaluate(node[0], env))) : []

        args.forEach(arg => {
          const key = arg[0].type === 'identifier' ? arg[0][0] : arg[0]
          const val = arg[1].type === 'identifier' ? env.get(arg[1][0]) : arg[1]

          obj[key] = val
        })
        return obj
      } else if (type === 'undefined') {
        return undefined
      } else if (type === 'boolean') {
        return node[0] === 'true'
      } else if (type === 'this') {
        return env.this
      } else if (type === 'accessor') {
        const path = mapProps(getPath(node))
        // This is duplicate code, see getCaller()
        const prop = path.shift()

        let output = env.this[prop]

        path.forEach((p, i) => {
          if (output && (output.hasOwnProperty(p) || i === 0)) {
            output = output[p]
          } else {
            throw TypeError(`Cannot read property ${p} of ${output}`)
          }
        })
        return output
      } else if (type === 'call') {
        const fnName = node[0][0]
        let path = []
        let fn

        if (fnName.type && fnName.type === 'functionExpression') {
          fn = evaluate(node[0], env)[0]
        } else if (fnName.type === 'accessor') {
          path = mapProps(flattenList(fnName))

          path.pop()

          fn = evaluate([fnName], env)[0]
        } else {
          fn = env.get(fnName[0])
        }

        const args = evaluate(flattenList(node[1][0]), env).map(arg =>
          arg !== undefined && arg.type === 'identifier' ? env.get(arg[0]) : arg
        )
        let caller = getCaller(path, env)

        if (typeof fn === 'function') {
          return fn.apply(caller, args)
        } else {
          throw new TypeError(`${fnName} is not a function`)
        }
      } else if (type === 'program') {
        return evaluate(node, env)
      } else if (type === 'number') {
        return node[0]
      } else if (type === 'string') {
        return node[0]
      } else if (type === 'assign') {
        const op = node[1]
        const operation = getOperation(op, 'assign')
        const left = evaluate(node[0], env)[0][0]
        const right = evaluate(node[2], env)[0]

        return operation(left, right, env)
      } else if (type === 'binop') {
        const op = node[1]
        let left = evaluate([node[0]], env)[0][0]
        let right = evaluate([node[2]], env)[0][0]

        if (left.type && left.type === 'identifier') {
          left = env.get(left[0])
        }

        if (right.type && right.type === 'identifier') {
          right = env.get(right[0])
        }

        const operation = getOperation(op, 'binary')

        if (operation) {
          return operation(left, right)
        }
      } else if (node.type === 'uop') {
        const operation = getOperation(node[0], 'unary')

        if (operation) {
          return operation(evaluate([node[1]], env)[0])
        }
      } else if (node.type === 'identifier') {
        return node
      } else if (Array.isArray(node)) {
        return evaluate(node, env)
      } else {
        return undefined
      }
    })
    .filter(n => n !== null)

class Interpreter {
  constructor(AST) {
    this.AST = AST
  }

  interpret(env = new Environment()) {
    // Hack for returning an identifier

    let val = evaluate(this.AST, env)[0].pop()

    if (val && val.type && val.type === 'identifier') {
      val = env.this ? env.this[val[0]] : undefined
    }

    return val === undefined ? '' : val
  }
}

export default Interpreter
