const throwError = (msg, line, col) => {
  throw new Error(`${msg} (line: ${line}, col: ${col})`)
}

export default throwError