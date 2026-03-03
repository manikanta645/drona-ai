const fs = require('fs');
const s = fs.readFileSync('src/App.js', 'utf8');
const lines = s.split(/\r?\n/);

// Count divs from line 1213 onwards (where return starts)
let divCount = 0;
let openCount = 0;
let closeCount = 0;

for (let i = 1212; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  
  if (opens > 0 || closes > 0) {
    console.log(`Line ${i+1} (${opens}/${closes}): ${line.trim()}`);
  }
  
  openCount += opens;
  closeCount += closes;
}

console.log(`\nTotal: ${openCount} open divs, ${closeCount} close divs, diff: ${openCount - closeCount}`);
