const fs=require('fs');
const s=fs.readFileSync('src/App.js','utf8');
const start=s.indexOf('return (');
if(start===-1){console.error('no return found'); process.exit(1)}
const tail=s.slice(start);
const open=(tail.match(/<div\b/g)||[]).length;
const close=(tail.match(/<\/div>/g)||[]).length;
console.log('open divs:',open,'close divs:',close,'diff',open-close);
