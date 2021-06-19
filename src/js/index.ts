import {Programm} from "./ParserTreeNodes";
import CodeMirror from "codemirror";
import RuntimeEnv from "./RuntimeEnv";
import {safeQuerySelector} from "./DOMManipulators";
import compile from "./Compiler";

console.log("hello there!");

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

var programm: Programm = compile(codeMirror.getValue());

const register = safeQuerySelector('#register-body');
const stack = safeQuerySelector('#stack-body');


safeQuerySelector<HTMLButtonElement>('#btn-reset-runtime').onclick = () => {
    register.innerText = stack.innerText = "";
    RuntimeEnv.reset();
};
safeQuerySelector<HTMLButtonElement>('#btn-run').onclick = () => {programm = compile(codeMirror.getValue()); programm.run();};
safeQuerySelector<HTMLButtonElement>('#btn-step').onclick = () => programm.step();
