import {readFileSync, readdirSync} from 'fs'
import 'path';
import execute from '../src/Executor';

import parse from '../src/Parser'
import path = require('path/posix');
import {MemorySnapshot} from '../src/Memory'
import gitDiff = require('git-diff');

import * as yaml from 'js-yaml';

const programDir = path.resolve('tests', 'programs');

type Snapshot = {
    memory: MemorySnapshot;
    stack: number[];
};

function testProgram(alphaPath: string)
{
    console.log(`### Program ${alphaPath}`);
    
    const parsedAlphaPath = path.parse(alphaPath);
    const resultPath = path.join(parsedAlphaPath.dir, parsedAlphaPath.name + '.result.yaml');

    const fileString = String(readFileSync(alphaPath, 'utf8'));
    
    const program = parse(fileString);
    const snapshot = execute(program);

    const resultString = readFileSync(resultPath, 'utf8');
    const result: any = yaml.load(resultString);
    if(!result.hasOwnProperty('memory')) result['memory'] = {};
    if(!result.hasOwnProperty('stack')) result['stack'] = [];

    const stringify = (obj: object) => JSON.stringify(obj, null, '\t')
    const diff = gitDiff(stringify(snapshot), stringify(result), {color: true, wordDiff: true});
    console.log(diff ?? "<result matches>", '\n\n');
}

readdirSync(programDir)
    .filter(filename => path.extname(filename) == '.alpha')
    .map(filename => path.join(programDir, filename))
    .forEach(filename => testProgram(filename));