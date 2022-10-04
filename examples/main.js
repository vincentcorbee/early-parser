import { Parser, Lexer } from '../'

import grammer from './grammer-a'
import tokens from './tokens-a'
import { printAST, printParseTree, printChart } from '../src/utils'
import { ASI } from '../src'

import './register-service-worker'

const input = document.getElementById('code')
const code = input.value
const chartEl = document.getElementById('chart')
const parseTreeEl = document.getElementById('parseTree')
const astEl = document.getElementById('ast')

const lexer = new Lexer()
const parser = new Parser(lexer)
let comments = []

lexer.tokens(tokens)

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
          value: substr
        })

        return lexer.line += match.length
      }
    }
  ])

  lexer.ignore(/^[ \t\v\r]+/)
  lexer.error(lexer => lexer.skip(1))
})

lexer.ignore(/^[ \t\v\r]+/)
lexer.ignore(/^\/\/.*/)

parser.grammer(grammer)

// parser.error = err => {

//   try {
//     return ASI(parser, err)
//   } catch(ASIError) {
//     astEl.innerHTML = '',
//     parseTreeEl.innerHTML = ''
//     chartEl.innerHTML = ''

//     // printChart(err.chart, chartEl)

//   // console.log(lexer.tokens)
//     astEl.innerHTML = ASIError.message
//   }
// }

const parse = (source) => {
  astEl.innerHTML = '',
  parseTreeEl.innerHTML = ''
  chartEl.innerHTML = ''
  comments = []

  lexer.input(source)

  parser.reset();

  parser.parse(({ AST, parseTree }) => {
    const [program] = AST

    document.getElementById('ast').innerHTML = `<pre>${JSON.stringify({
      type: 'File',
      program,
      comments
    }, null, 2)}</pre>`

    // The trees created are represented as an array, containing a tree for each finished state

    // printChart(chart, chartEl)

    // parseTree.forEach(parseTree => printParseTree(parseTree, parseTreeEl))

    // AST.forEach(AST => printAST(AST, astEl))
    // console.log(AST)
    // console.log(lexer.source)
    // console.log(AST)
  })
}

input.addEventListener('input', e => parse(e.target.value))

parse(code)
