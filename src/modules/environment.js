const _private = new WeakMap()
// Global should hold the variables
class Global {}

export class Environment {
  constructor(_parent = null, _global = null) {
    const _this = _parent ? null : _global || new Global()
    const _variables = _parent ? {} : _this

    // If Globalcode, this is set to Global object, else this is null and set at function execution

    const _proxy = new Proxy(_variables, {
      get(target, prop) {
        if (target.hasOwnProperty(prop)) {
          return Reflect.get(target, prop)
        } else if (_parent) {
          return _parent.get(prop)
        } else {
          throw new ReferenceError(`${prop} is not defined.`)
        }
      },
      set(target, prop, value) {
        if (target.hasOwnProperty(prop)) {
          return Reflect.set(target, prop, value)
        } else if (_parent) {
          return _parent.set(prop, value)
        } else {
          throw new ReferenceError(`${prop} is not defined.`)
        }
      },
    })

    _private.set(this, {
      _variables,
      _proxy,
      _parent,
      _this,
    })
  }
  get parent() {
    return _private.get(this)._parent
  }
  get this() {
    return _private.get(this)._this
  }
  set this(val) {
    return (_private.get(this)._this = val)
  }
  extend() {
    return new Environment(this)
  }
  define(prop, type, value = undefined) {
    if (type !== 'var' && _private.get(this)._variables.hasOwnProperty(prop))
      throw new SyntaxError(`Identifier '${prop}' has already been declared.`)

    return (_private.get(this)._variables[prop] = value)
  }
  get(prop) {
    return _private.get(this)._proxy[prop]
  }
  set(prop, value) {
    return (_private.get(this)._proxy[prop] = value)
  }
}
