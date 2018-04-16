var minify = require('html-minifier').minify;
var fs = require('fs');
var path = require('path');

function readDirR(dir) {
    return fs.statSync(dir).isDirectory()
        ? Array.prototype.concat(...fs.readdirSync(dir).map(f => readDirR(path.join(dir, f))))
        : dir;
}

// minify all html files in src and output them to dist.
var progmem = "";
readDirR('./src/').forEach((inFilePath) => {
  var outFilePath = 'dist/'+path.basename(inFilePath.replace(/(.html)$/, '.min.html'));
  var contents = fs.readFileSync(inFilePath).toString();
  var output = minify(contents, {
    collapseInlineTagWhitespace: true,
    minifyCSS: true,
    minifyJS: {
      compress: {
        passes: 3,
        reduce_funcs: true,
        reduce_vars: true,
        evaluate: true,
        collapse_vars: true,
        join_vars: true,
        drop_console: true,
        inline: false,
        unsafe_math: true,
        unsafe_proto: true,
        keep_fnames: false
    }},
    removeComments: true,

  });
  output = output.replace(/\r?\n/g,'');
  progmem += "const char "+path.basename(inFilePath.replace(/(.html)$/, '')).toUpperCase()+"[] PROGMEM = " + JSON.stringify(output)+";\n";
  fs.writeFileSync(outFilePath, output);
  console.log( 'in: '+inFilePath, contents.length, 'out: ' +outFilePath, output.length,'saved: '+ (100-output.length/contents.length*100).toFixed(2)+'%');
});

fs.writeFileSync('dist/PROGMEM.h', progmem);
