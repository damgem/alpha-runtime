import {readFileSync, readdirSync} from 'fs'
import {basename, resolve, extname} from 'path';

import {tokenize, TokenType, Pattern} from '../src/Tokenizer'

const programDir = resolve(__dirname, 'programs');

function testProgram(filename: string)
{
    
    console.log(`### Tokenizing ${basename(filename)}`);
    const fileString = String(readFileSync(resolve(programDir, filename)));
    const tokens = tokenize(fileString);

    const lines = tokens.map((pair) => {
        const pattern: Pattern = pair[0] as Pattern;
        let inp: string = pair[1] as string;
        if(pattern.type === TokenType.SPACE) return null;
        if(pattern.type === TokenType.NEWLINE) return "\n";
        inp = inp.replace(/[\r\n]/, "");    // needed for COMMENTS
        return `${pattern.toString()} "${inp}", `
    }).join("");

    const output = lines.split('\n').map(l => l.endsWith(", ") ? l.substr(0, l.length-2) : l).join("\n");
    console.log(output, "\n");
}

readdirSync(resolve(__dirname, 'programs'))
    .filter(filename => extname(filename) == '.alpha')
    .forEach(filename => testProgram(filename))

