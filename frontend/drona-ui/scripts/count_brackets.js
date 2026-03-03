const fs = require('fs');
const s = fs.readFileSync('src/App.js', 'utf8');

let opens = {};
let closes = {};

for (let char of s) {
  if (char === '{') opens['{'] = (opens['{'] || 0) + 1;
  if (char === '}') closes['}'] = (closes['}'] || 0) + 1;
  if (char === '[') opens['['] = (opens['['] || 0) + 1;
  if (char === ']') closes[']'] = (closes[']'] || 0) + 1;
  if (char === '(') opens['('] = (opens['('] || 0) + 1;
  if (char === ')') closes[')'] = (closes[')'] || 0) + 1;
}

console.log('Braces    {}: ' + (opens['{'] || 0) + ' opens, ' + (closes['}'] || 0) + ' closes');
console.log('Brackets  []: ' + (opens['['] || 0) + ' opens, ' + (closes[']'] || 0) + ' closes');
console.log('Parens    (): ' + (opens['('] || 0) + ' opens, ' + (closes[')'] || 0) + ' closes');
