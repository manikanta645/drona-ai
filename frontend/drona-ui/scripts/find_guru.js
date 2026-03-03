const fs=require('fs');const s=fs.readFileSync('src/App.js','utf8');const lines=s.split(/\r?\n/);
let stack=[];
for(let i=0;i<lines.length;i++){
  const l=lines[i];
  if(/<div\s/.test(l)){
    const match=l.match(/className=["\']([^"\']*)/);
    const cls=match?match[1]:'';
    if(cls.includes('guru-container')){
      stack.push({cls,line:i+1});
    }
  }
  if(/<\/div>/.test(l) && stack.length>0 && stack[stack.length-1].cls.includes('guru-container')){
    const item=stack[stack.length-1];
    console.log('Found close of guru-container at line',i+1,'opened at',item.line);
    stack.pop();
  }
}
