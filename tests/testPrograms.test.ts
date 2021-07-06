import fs from 'fs';
import path from 'path';
import compile, { CompilationResult } from '../src/js/Compiler';
import RuntimeCore from '../src/js/RuntimeCore';
import RuntimeEnv from '../src/js/RuntimeEnv';
import { CodeLine } from '../src/js/ParserTreeNodes';
import { OberservableMap, OberservableStack } from '../src/js/Observables';

// Extend Jest Matcher to include `toBeCompiledSuccessfully()` 
declare global {
  namespace jest {
    interface Matchers<R> {
        toBeCompiledSuccessfully(): R;
    }
  }
}

expect.extend({
    toBeCompiledSuccessfully(received: CompilationResult) {
        if(received.successful) {
            if(received.compiledCode !== undefined) {
                return {
                    message: () => "Compilation did not fail",
                    pass: true
                };
            }
            else {
                return {
                    message: () => `Compilation does not produce any code! (${received.errorMessage??"<No Additional Information>"})`,
                    pass: false
                };
            }
        } else {
            return {
                message: () => `Compilation failed: ${received.errorMessage??"<No Error Message Recieved>"}` + (received.context? `\n>>> Context:\n${received.context}\n>>>` : ""),
                pass: false
            };
        }
    }
});



type TestGenerator = (re: RuntimeCore) => void;

function toTestGenerator(keyword: string, value: string): TestGenerator {
    switch(keyword) {

        case "accumulator":
            const expectedAccumulator = Number(value);
            expect(expectedAccumulator).toBe(Number);
            return (re: RuntimeCore) => it("Accumulator", () => expect(re.accumulator).toBe(expectedAccumulator));
        

        case "stack":
            // extract expected Stack
            const expectedStack = value.split(',').map(Number);
            expect(expectedStack.every(x => !isNaN(x))).toBe(true);

            // build ObservableStack
            const expectedObservableStack: OberservableStack<number> = new OberservableStack();
            expectedStack.forEach(n => expectedObservableStack.push(n));

            // return individual test generator
            return (re: RuntimeCore) => it("Stack", () => expect(re.stack).toEqual(expectedObservableStack));


        case "memory":
            // create Observable Map to insert into later
            const expectedObservableMap: OberservableMap<string, number> = new OberservableMap();

            value.split(',').forEach(kvString => {
                // extract key value
                const splittedKvString = kvString.split(':');
                expect(splittedKvString.length).toBe(2);
                const [k, stringV] = splittedKvString;
                const v = Number(stringV);
                expect(k).toBe(String);
                expect(v).toBe(Number);
                // insert into map
                expectedObservableMap.set(k.trim(), v);
            });

            // return individual test generator
            return (re: RuntimeCore) => it("Memory", () => expect(re.stack).toEqual(expectedObservableMap)); 


        default:
            throw Error(`Invalid assertion statement @${keyword}!`);
    }
} 


function testProgram(filename: string) {
    
    describe(path.basename(filename), () => {
    
        let fileString: string = String(fs.readFileSync(path.resolve(__dirname, 'testPrograms', filename))).trim();

        // extract lines at the top starting with "@" and convert them into testGerators
        const testGenerators: TestGenerator[] = [];
        while(fileString.length && fileString[0] === "@") {
            const lines   = fileString.split('\n');
            const line    = lines[0];
            const keyword = line.split(' ')[0].slice(1).toLowerCase();

            testGenerators.push(toTestGenerator(keyword, line.slice(1 + keyword.length)));
            fileString = lines.slice(1).join("\n").trimStart();
        }

        let program: CodeLine[];        
        describe("Compilation", () => {
            let compilationResult: CompilationResult; 
            expect(() => compilationResult = compile(fileString)).not.toThrow();
            expect(compilationResult).toBeCompiledSuccessfully();

            program = compilationResult.compiledCode;            
        });
        if(program === undefined) return;
        
        const pe: RuntimeEnv = new RuntimeEnv({});
        describe("Execution", () => {
            expect(() => {
                pe.load(program);
                pe.run();
            }).not.toThrow();
        });

        if(testGenerators.length) {
            describe("Result", () => testGenerators.forEach(gen => gen((pe as any).core)));
        }
    });
}


// each compilation and execution should only last 1 second at most
jest.setTimeout(1000);

// test every program in ./testPrograms/
fs.readdirSync(path.resolve(__dirname, 'testPrograms'))
    .filter(filename => path.extname(filename) == '.alpha')
    .forEach(filename => testProgram(filename))