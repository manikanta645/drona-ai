const fs = require('fs');
const s = fs.readFileSync('src/App.js', 'utf8');

// Count {... && ( patterns and matching )}
const opens = (s.match(/\{[^}]*&&\s*\(/g) || []).length;
const closes = (s.match(/\)\}/g) || []).length;

console.log(`Opens ({...&&\u0028): ${opens}`);
console.log(`Closes ()\}): ${closes}`);
console.log(`Difference: ${opens - closes}`);
