import parse from '../src/Parser';

const x = parse("if α > 3 then goto 1;");
console.log(x);