const path = require('path')

require('esbuild').build({
  entryPoints: {
    index: path.resolve(__dirname, path.join('..', 'src', 'index.js')),
    utils: path.resolve(__dirname, path.join('..', 'src', 'utils', 'index.js')),
  },
  outdir: 'lib',
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['esnext'],
  watch: true,
  sourcemap: true,
})
