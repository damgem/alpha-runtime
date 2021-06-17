import {parse, SyntaxError} from "./parser";
import {Programm} from "./ParserTreeNodes";
import CodeMirror from "codemirror";

console.log("hello there!");

function alertError(msg: string): never {
    window.alert(msg);
    throw new Error(msg);
}

function safeQuerySelector<ElementType extends HTMLElement>(query: string): ElementType {
    const element = document.querySelector(query);
    if(element === null) alertError(`Critical Error: cannot find ${query} element!`);
    return element as ElementType;
}

// init Code Mirror window
var codeMirror = CodeMirror(safeQuerySelector('#codemirror'), {
    lineNumbers: true,
    tabSize: 4,
    lineWrapping: true,
    value: 'p(1) := 4;\np(2) := 7;\na := p(1) + p(2);\np(result) := a % 8;',
    autofocus: true,
    inputStyle: 'contenteditable'
});

declare global {
    interface Window {programm: Programm;}
}

window.programm = parse(codeMirror.getValue());

function compile(): void {
    try{
        window.programm = parse(codeMirror.getValue());
        console.log(window.programm);
        console.log("successfully compiled!");
    }
    catch(e) {
        if(e instanceof SyntaxError) {
            let error: SyntaxError = e;
            let {start, end} = error.location;
            console.log(`Syntax Error at ${start.line}:${start.column}-${end.line}:${end.column}: Invalid code "${error.found}" in this context.`);
            console.log(error);
        }
        else window.alert(`Unhandeled Exception: ${e}`);
        throw e;
    }
}

const register = safeQuerySelector('#register-body');
const stack = safeQuerySelector('#stack-body');


safeQuerySelector<HTMLButtonElement>('#btn-reset-runtime').onclick = () => register.innerText = stack.innerText = "";
safeQuerySelector<HTMLButtonElement>('#btn-run').onclick = () => {compile(); window.programm.run();};
safeQuerySelector<HTMLButtonElement>('#btn-step').onclick = () => window.programm.step();