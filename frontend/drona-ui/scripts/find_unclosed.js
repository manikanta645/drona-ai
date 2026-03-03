const fs = require('fs');
const s = fs.readFileSync('src/App.js', 'utf8');
const lines = s.split(/\r?\n/);

// Track open divs with their class names
let stack = [];

for (let i = 1212; i < lines.length; i++) {
  const line = lines[i];
  
  // Find all <div ...> openings
  const openMatches = line.matchAll(/<div[^>]*className="([^"]*)"/g);
  for (const match of openMatches) {
    const className = match[1];
    stack.push({ className, line: i+1 });
  }
  
  // Find self-closing <div ... /> - don't increment stack
  const selfClosing = line.matchAll(/<div[^>]*\/>/g);
  let selfCloseCount = 0;
  for (const match of selfClosing) {
    selfCloseCount++;
  }

  // Find closing </div> - but need to account for self-closing ones
  const normalCloses = (line.match(/<\/div>/g) || []).length;
  const totalDivOpens = (line.match(/<div/g) || []).length;
  const closingNeeded = normalCloses + selfCloseCount;
  
  for (let j = 0; j < closingNeeded && stack.length > 0; j++) {
    const popped = stack.pop();
  }
}

console.log(`Unclosed divs (${stack.length}):`);
for (let item of stack) {
  console.log(`  Line ${item.line}: className="${item.className}"`);
}
