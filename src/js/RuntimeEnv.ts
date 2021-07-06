import RuntimeCore, { RuntimeCallbacks } from './RuntimeCore'
import { CodeLine } from './ParserTreeNodes';
import { Executable } from './AbstractTreeNodes';

export default class RuntimeEnv {

    private core: RuntimeCore;
    codeLines: CodeLine[] = [];

    constructor(callbacks: RuntimeCallbacks) {
        this.core = new RuntimeCore(callbacks);
    }

    /** Loads a program into program memory and builds the labels index.
     * @param codeLines a list of CodeLines that resemble the program in that order. 
     */
    public load(codeLines: CodeLine[]) {
        this.codeLines = codeLines;
        this.core.labels = {};
        for(let cli = 0; cli < codeLines.length; cli++) {
            let label = codeLines[cli].label;
            if(label !== undefined) {this.core.labels[label] = cli;}
        }
    }

    public run() {
        if(!this.codeLines.length) this.core.isRunning = false;
        while(this.core.isRunning) {
            this.step();
        }
    }

    public step(): void {
        if(!this.core.isRunning) return;
        
        let lineNumber: number = this.core.instructionCounter;
        try{
            this.codeLines[lineNumber].execute(this.core);
            this.finishStatementExecution();
        } catch(error) {
            this.core.isRunning = false;
            this.core.error(error);
        }
    }

    protected finishStatementExecution() {
        if(this.core.instructionCounter == this.codeLines.length-1 && this.core.instructionCounterNext === undefined) {
            this.core.isRunning = false;
            return;
        }
        if(this.core.isRunning && this.core.instructionCounterNext === undefined) this.core.instructionCounter++;
        this.core.instructionCounterNext = undefined;
    }
}