const fs=require('fs');const path='src/App.js';const s=fs.readFileSync(path,'utf8');const lines=s.split(/\r?\n/);
let stack=[];
const tagRegex=/<\/?([a-zA-Z0-9-]+)([^>]*)>/g;
let lineStart=0;
for(let i=0;i<lines.length;i++){
  const line=lines[i];
  let match;
  while((match=tagRegex.exec(line))){
    const full=match[0];const name=match[1];
    const isClosing=full.startsWith('</');
    const isSelfClosing=full.endsWith('/>') || /<[^>]+\/\s*>$/.test(full);
    if(name.toLowerCase()==='div'){
      if(isClosing){
        if(stack.length===0){
          console.log('Unmatched closing </div> at line',i+1);
        } else {
          stack.pop();
        }
      } else if(isSelfClosing){
        // ignore
      } else {
        stack.push({name:'div',line:i+1});
      }
    }
  }
}
console.log('Unclosed divs count:',stack.length);
if(stack.length) console.log('Unclosed divs (bottom->top):', stack.map(x=>x.line));
else console.log('All divs closed.');
