const fs = require('fs');
const babelParser = require('@babel/parser');

const code = fs.readFileSync('src/App.js', 'utf8');

try {
  const result = babelParser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
  console.log('✅ PARSE_SUCCESS');
} catch (err) {
  console.log('❌ PARSE_ERROR:', err.message);
  
  // Print around the error location
  if (err.loc) {
    const lines = code.split('\n');
    const line = err.loc.line - 1;
    const col = err.loc.column;
    
    console.log(`\nError at line ${err.loc.line}, column ${col}:`);
    console.log(`Lines around error:`);
    for (let i = Math.max(0, line - 2); i <= Math.min(lines.length - 1, line + 2); i++) {
      const marker = i === line ? '>>> ' : '    ';
      console.log(`${marker}${i+1}: ${lines[i]}`);
    }
  }
}
