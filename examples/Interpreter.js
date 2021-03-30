import flattenList from './src/helpers/flattenList'

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
const setObservable = (prop, data, directive) => {
  data = data.this ? data.this.data : data
  // console.log(data, prop)
  // if (directive && !directive.isBound) {
  if (directive) {
    if (data && data.hasOwnProperty(prop) && data.__observable__) {
      // console.log(data.__observable__.__observers__)
      // console.log(directive, prop)
      const subscribed = data.__observable__.subscribe(directive, prop)

      if (subscribed && directive.observables.indexOf(data.__observable__) === -1) {
        directive.observables.push(data.__observable__)
      }

      // Dit werkt niet goed
      data = data[prop] && data[prop].__observable__ ? data[prop] : undefined

      if (data) {
        if (data.constructor.name === 'Mask') {
          for (const prop in data) {
            setObservable(prop, data, directive)
          }
        } else if (data.constructor.name === 'ArrayMask') {
          const subscribed = data.__observable__.subscribe(directive, prop)

          if (subscribed && directive.observables.indexOf(data.__observable__) === -1) {
            directive.observables.push(data.__observable__)
          }

          data.forEach(entry => {
            if (entry.constructor.name === 'Mask') {
              for (const prop in entry) {
                setObservable(prop, entry, directive)
              }
            }
          })
        }
      }
    }
  }
}

// This could overflow the stack -_-
const evalExp = (tree, env = {}, directive = null) =>
  tree
    .map((node, i) => {
      const type = node.type
      if (type === 'tenary') {
        return evalExp(node[0], env)[0]
          ? evalExp(node[1], env, directive)[0]
          : evalExp(node[2], env, directive)[0]
      } else if (type === 'arrayLiteral') {
        return evalExp(node[0], env)
      } else if (type === 'objectLiteral') {
        const obj = {}
        const args = node[0]
          ? mapFieldList(flattenList(evalExp(node[0], env, directive)))
          : []

        args.forEach(arg => {
          if (arg[0].type === 'identifier') {
            setObservable(arg[0][0], env, directive)
          }

          if (arg[1].type === 'identifier') {
            setObservable(arg[1][0], env, directive)
          }

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

        let output =
          prop === '$route'
            ? env.this[prop]
            : env.this.data
            ? env.this.data[prop]
            : undefined

        // This is shit
        if (output && output.__observable__) {
          setObservable(prop, output, directive)
        }

        path.forEach((p, i) => {
          if (output && (output.hasOwnProperty(p) || i === 0)) {
            let base = output

            output = output[p]

            base = output.__observable__ ? output : base.__observable__ ? base : null

            if (base) {
              setObservable(p, base, directive)
            }
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
          fn = evalExp(node[0], env, directive)[0]
        } else if (fnName.type === 'accessor') {
          path = mapProps(flattenList(fnName))

          path.pop()

          fn = evalExp([fnName], env, directive)[0]
        } else {
          fn = env.get(fnName[0])
        }

        const args = evalExp(flattenList(node[1][0], directive), env).map(arg =>
          arg !== undefined && arg.type === 'identifier' ? env.get(arg[0]) : arg
        )
        let caller = getCaller(path, env)

        if (typeof fn === 'function') {
          return fn.apply(caller, args)
        } else {
          throw new TypeError(`${fnName} is not a function`)
        }
      } else if (type === 'program') {
        return evalExp(node, env, directive)
      } else if (type === 'number') {
        return node[0]
      } else if (type === 'string') {
        return node[0]
      } else if (type === 'assign') {
        const op = node[1]
        const operation = getOperation(op, 'assign')
        const left = evalExp(node[0], env, directive)[0][0]
        const right = evalExp(node[2], env, directive)[0]

        return operation(left, right, env)
      } else if (type === 'binop') {
        const op = node[1]
        let left = evalExp([node[0]], env, directive)[0][0]
        let right = evalExp([node[2]], env, directive)[0][0]

        if (left.type && left.type === 'identifier') {
          setObservable(left[0], env, directive)
          left = env.get(left[0])
        }

        if (right.type && right.type === 'identifier') {
          setObservable(right[0], env, directive)
          right = env.get(right[0])
        }

        const operation = getOperation(op, 'binary')

        if (operation) {
          return operation(left, right)
        }
      } else if (node.type === 'uop') {
        const operation = getOperation(node[0], 'unary')

        if (operation) {
          return operation(evalExp([node[1]], env, directive)[0])
        }
      } else if (node.type === 'identifier') {
        return node
      } else if (Array.isArray(node)) {
        return evalExp(node, env, directive)
      } else {
        return undefined
      }
    })
    .filter(n => n !== null)

class Interpreter {
  constructor(AST) {
    const self = this
    self.AST = AST
  }
  interpret(env = null, directive = null) {
    const self = this

    env = env || new Environment()
    // Hack for returning an identifier
    // let val = evalExp(self.AST, env, directive)[0][0].pop()
    let val = evalExp(self.AST, env, directive)[0].pop()

    if (val && val.type && val.type === 'identifier') {
      setObservable(val[0], env, directive)

      val = env.this.data ? env.this.data[val[0]] : undefined
    }

    return val === undefined ? '' : val
  }
}
export default Interpreter
