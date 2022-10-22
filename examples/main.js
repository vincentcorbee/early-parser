// import grammar from './grammer-a'
import grammar from './grammar-c'
// import grammar from './grammer-b'
import tokens from './tokens-a'
import { ASI, Parser, Lexer } from '../lib'
import { printChart, printParseTree } from '../lib/utils'

// import './register-service-worker'

const inputEl = document.getElementById('code')
const chartEl = document.getElementById('chart')
const parseTreeEl = document.getElementById('parseTree')
const astEl = document.getElementById('ast')
const durationEl = document.getElementById('duration')

const code = inputEl.value

const lexer = new Lexer()
const parser = new Parser(lexer)

let comments = []

// lexer.tokens(tokens)

lexer.state('COMMENT', lexer => {
  lexer.tokens([
    {
      name: 'ENDCOMMENT',
      reg: /^\*\//,
      begin: 'INITIAL',
      cb: (substr, lexer) => {
        const match = substr.match(/\n/g) || []

        comments.push({
          type: 'CommentBlock',
          value: substr,
        })

        return (lexer.line += match.length)
      },
    },
  ])

  lexer.ignore(/^[ \t\v\r]+/)
  lexer.error(lexer => lexer.skip(1))
})

lexer.ignore(/^[ \t\v\r]+/)
lexer.ignore(/^\/\/.*/)

parser.grammer(grammar)

parser.error = err => {
  // try {
  //   return ASI(parser, err)
  // } catch (ASIError) {
  astEl.innerHTML = ''
  // parseTreeEl.innerHTML = ''
  chartEl.innerHTML = ''

  printChart(err.chart, chartEl)

  // console.log(lexer.tokens)
  // console.dir(ASIError)

  // astEl.innerHTML = ASIError.message
  // }
}

const parse = source => {
  astEl.innerHTML = ''
  // parseTreeEl.innerHTML = ''
  chartEl.innerHTML = ''
  comments = []

  lexer.input(source)

  parser.reset()

  parser.parse(({ AST, time, chart, parseTree }) => {
    const [program] = AST

    durationEl.textContent = `${Math.round(time)}ms`

    // astEl.innerHTML = `<pre>${JSON.stringify(
    //   {
    //     type: 'File',
    //     program,
    //     comments,
    //   },
    //   null,
    //   2
    // )}</pre>`

    printParseTree(parseTree[0], astEl)

    // The trees created are represented as an array, containing a tree for each finished state

    printChart(chart, chartEl)

    // parseTree.forEach(parseTree => printParseTree(parseTree, parseTreeEl))

    // AST.forEach(AST => printAST(AST, astEl))
    // console.log(AST)
    // console.log(lexer.source)
    // console.log(AST)
  })
}

inputEl.addEventListener('input', e => parse(e.target.value))

inputEl.addEventListener('keydown', e => {
  const { code, target } = e

  if (code === 'Tab') {
    e.preventDefault()

    document.execCommand('insertText', false, '\t')

    // const start = target.selectionStart
    // const oText = target.value
    // const nText = oText.substring(0, start) + '\t' + oText.substring(start, oText.length)

    // target.value = nText

    // target.setSelectionRange(start + 1, start + 1)
  }
})

parse(code)
