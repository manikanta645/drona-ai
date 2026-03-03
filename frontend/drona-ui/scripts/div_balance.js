const fs = require('fs');
const s = fs.readFileSync('src/App.js', 'utf8');
const lines = s.split(/\r?\n/);

let opens = 0;
let closes = 0;

for (let i = 1212; i < lines.length; i++) {
  const line = lines[i];
  
  // Count all <div occurrences
  const openCount = (line.match(/<div/g) || []).length;
  const selfCloseCount = (line.match(/\/>/g) || []).length;
  const closeCount = (line.match(/<\/div>/g) || []).length;
  
  // Actual opens = <div without />
  const actualOpens = openCount - selfCloseCount;
  opens += actualOpens;
  closes += closeCount;
  
  // Show where balance changes most
  if (actualOpens > 0 || closeCount > 0) {
    const diff = opens - closes;
    if (Math.abs(actualOpens - closeCount) > 1 || diff > 10) {
      console.log(`Line ${i+1} (+${actualOpens},-${closeCount}) balance=${opens-closes}: ${line.trim().substring(0, 80)}`);
    }
  }
}

console.log(`\nFinal: ${opens} opens, ${closes} closes, diff: ${opens - closes}`);
