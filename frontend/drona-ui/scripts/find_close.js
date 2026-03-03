const fs = require('fs');
const s = fs.readFileSync('src/App.js', 'utf8');
const lines = s.split(/\r?\n/);

// Find opening and closing of guru-container
for (let i = 1330; i < 1400; i++) {
  if (i === 1330) console.log(`Line ${i+1}: ${lines[i]}`);
}

// Look for the CLOSING of guru-container - search from end
let foundClose = false;
for (let i = lines.length - 1; i >= 1330; i--) {
  const line = lines[i];
  if (line.includes('</div>') && !line.includes('message') && !line.includes('tab')) {
    console.log(`Line ${i+1}: ${line}`);
    if (i >= 1890) foundClose = true;
  }
  if (foundClose && i < 1850) break;
}

// Also find the input-box conditional closing
for (let i = 1860; i < 1895; i++) {
  if (lines[i].includes('</div>') || lines[i].includes(')}')) {
    console.log(`Line ${i+1}: ${lines[i]}`);
  }
}
