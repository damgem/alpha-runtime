import {parse, SyntaxError} from "./parser";
import { Programm } from "./ParserTreeNodes";

export default function compile(codeString: string): Programm {
    try{
        return parse(codeString);
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