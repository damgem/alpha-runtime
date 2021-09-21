# Alpha Runtime

Alpha Runtime provides a way to execute programs written in the assemlber language "α-Notation".

The α-Notation is originally a pseudo assembler language that I got introduced to in the module "Systemnahme Informatik (SS 2021)" at Uni Bonn.
It is a simplified assembler for educational purposes.

# How to use

Here's the starter template for Node.js and ES6 JS. Make sure to check out the JSDoc documentation for more detailed information!

## Node.js (Typescript)
```js
import execute from './alpha-runtime/Executor'
import parse from './alpha-runtime/Parser'

const code = String(readFileSync('./alpha-runtime/tests/programs/add42.alpha', 'utf8'));
const program = parse(code);
const runtimeState = execute(program);

// do something with the resulting runtimeState
```

You can create a own `Runtime` object with custom callback functions and pass this runtime into the `execute` function.

```js
const runtime = new Runtime(program, {
    onMemoryWrite: (writeAddress: String, newValue: number, wasInitialized: boolean) => console.log('memory write'),
    onStackChange: (value: number, type: OnStackChangeEventType) => console.log('stack change'),
    onCallStackChange?: (value: number, type: OnStackChangeEventType) => console.log('call stack change'),
    onInstructionPointerChange?: (value: number) => console.log('instruction pointer change'),
    onProgramEnd?: () => console.log('end of program')
});

const runtimeState = execute(program, runtime);
```

## ES6 JS
Make sure to build everything via webpack
```node
npm i
npm run build
```

```html
<script src='./alpha-runtime/dist/index.js'></script>
<script>
    let code = "ρ(1) := 10;\nρ(2) := 32;\nρ(result) := ρ(1) + ρ(2);"
    let program = parse(code);
    let runtimeState = execute(program);
</script>
```

# Structure
* `parse()` takes a string and convertes it into an AST. This is done via a [PEGJS](https://pegjs.org/) grammar that combines lexer and parser.
* `execute()` operates on a program and a runtime and keeps executing the next statement until the program halts.
* `Runtime` consists of 4 parts:
    * `stack` and `callstack`, which both use the custom `Stack` class 
    * `memory` which uses the custom `Memory` class
    * `codeManager` which uses the `CodeManager` class

You can learn more about these in the JSDoc of the individual classes.

# See also
This has been done before with Java and JavaFX, see [LowerAlpha](https://github.com/SirkoHoeer/LowerAlpha).
This project aims to be more robust, reliable and user friendly than LowerAlpha.
