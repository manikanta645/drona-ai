const fs = require('fs');
const s = fs.readFileSync('src/App.js', 'utf8');
const lines = s.split(/\r?\n/);

// Count JSX tags in guru-container block (1331 to 1898)
let opens = 0;
let closes = 0;
let stack = [];

for (let i = 1330; i <= 1897; i++) {
  const line = lines[i];
  
  // Self-closing components like <ShastraMode /> don't need closing
  const selfClosingComponents = line.match(/<[A-Z]\w+[^>]*\/>/g) || [];
  
  // Opening JSX elements (not self-closing)
  const openingElements = line.match(/<[A-Za-z]+[^/>]*[^/]>/g) || [];
  for (const el of openingElements) {
    if (!el.includes('/>')) {
      const match = el.match(/<(\w+)/);
      if (match) {
        stack.push({ tag: match[1], line: i+1 });
        console.log(`Line ${i+1}: OPEN <${match[1]}>`);
      }
    }
  }
  
  // Closing JSX elements
  const closingElements = line.match(/<\/[\w]+>/g) || [];
  for (const el of closingElements) {
    const match = el.match(/<\/(\w+)/);
    if (match && stack.length > 0) {
      const popped = stack.pop();
      console.log(`Line ${i+1}: CLOSE </${match[1]}> (matched ${popped.tag} from line ${popped.line})`);
    } else {
      console.log(`Line ${i+1}: CLOSE </${match[1]}> - NO MATCHING OPEN!`);
    }
  }
}

console.log(`\nRemaining unclosed: ${stack.length}`);
for (let item of stack) {
  console.log(`  <${item.tag}> from line ${item.line}`);
}
