import {parse, SyntaxError} from "./PegParser";
import { CodeLine } from "./ParserTreeNodes";


const escapeCharReplacements: {[orig: string]: string} = {
    "\\": "\\\\",
    "\n": "\\n",
    "\s": "\\s",
    "\r": "\\r",
    "\b": "\\b",
    "\f": "\\f",
    "\v": "\\v",
    "\t": "\\t"
};

function myEscape(text: string): string {

    return text.split("").map(c => {
        if(!(c in escapeCharReplacements)) return c;
        return escapeCharReplacements[c];
    }).join("");
}

export interface CompilationResult {
    successful: boolean;
    compiledCode?: CodeLine[];
    errorMessage?: string;
    context?: string;
}

export default function compile(codeString: string): CompilationResult {
    try{
        return {successful: true, compiledCode: parse(codeString)};
    }
    catch(error) {
        if(error instanceof SyntaxError) {
            const {start, end} = error.location;           

            return {
                successful: false,
                errorMessage: `Syntax Error at ${start.line}:${start.column}-${end.line}:${end.column}: ` + SyntaxError.buildMessage(error.expected, error.found),
                context: codeString.split("\n").slice(Math.max(0, start.line-2), Math.min(codeString.length, end.line+1)).join("\n")
            };
        }
        else {
            throw error;
        }
    }
}