import fs from 'fs';
import path from 'path';

import {tokenize} from '../src/TokenTypes'

function testProgram(filename: string)
{
    
    console.log(`### Tokenizing ${path.basename(filename)}`);
    let fileString = String(fs.readFileSync(path.resolve(__dirname, filename))).trim();
    const tokens = tokenize(fileString);
    console.log(tokens);
    console.log("\n");

}

fs.readdirSync(path.resolve(__dirname, 'testPrograms'))
    .filter(filename => path.extname(filename) == '.alpha')
    .forEach(filename => testProgram(filename))

