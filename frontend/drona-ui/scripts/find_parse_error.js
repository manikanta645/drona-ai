const fs=require('fs');const parser=require('@babel/parser');
const code=fs.readFileSync('src/App.js','utf8');
let lo=0, hi=code.length, bad=hi;
while(lo<hi){
  let mid=Math.floor((lo+hi)/2);
  let chunk=code.slice(0, mid);
  try{parser.parse(chunk,{sourceType:'module',plugins:['jsx','classProperties','optionalChaining','decorators-legacy']});
    lo=mid+1;
  }catch(e){
    bad=mid; hi=mid;
  }
}
console.log('first bad index approx', bad);
const start=Math.max(0,bad-400);
const end=Math.min(code.length,bad+400);
console.log('--- CONTEXT ---');
console.log(code.slice(start,end));
