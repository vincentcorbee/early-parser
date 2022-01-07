const _private = new WeakMap()

export default class Time {
  constructor() {
    _private.set(this, {
      start: null,
      end: null,
      intervals: []
    })
  }
  start() {
    _private.get(this).start = performance.now()

    return this
  }

  end() {
    _private.get(this).end = performance.now() - _private.get(this).start

    return this
  }

  lap() {}

  log(message) {
    const end = _private.get(this).end || performance.now()

    console.info(`${message !== undefined ? message + ' ' : ''}Execution time: %dms`, end)

    return this
  }
}
