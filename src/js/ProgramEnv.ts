import RuntimeEnv from './RuntimeEnv'
import { CodeLine } from './ParserTreeNodes';

export default class ProgramEnv extends RuntimeEnv {

    codeLines: CodeLine[] = [];

    /** Loads a program into program memory and builds the labels index.
     * @param codeLines a list of CodeLines that resemble the program in that order. 
     */
    load(codeLines: CodeLine[]) {
        this.codeLines = codeLines;
        this.labels = {};
        for(let cli = 0; cli < codeLines.length; cli++) {
            let label = codeLines[cli].label;
            if(label !== undefined) {this.labels[label] = cli;}
        }
    }

    run() {
        if(!this.codeLines.length) this.isRunning = false;
        while(this.isRunning) {
            this.step();
        }
    }

    step(): void {
        if(!this.isRunning) return;
        
        let lineNumber: number = this.instructionCounter;
        try{
            this.codeLines[this.instructionCounter].execute(this);
        } catch(error) {
            this.error(`Error on line ${lineNumber}: ${error.message}`);
            this.isRunning = false;
        }

        if(this.isRunning && !this.gotoPerformed) {
            this.instructionCounter++;
            if(this.instructionCounter === this.codeLines.length) this.isRunning = false;
        }

        this.gotoPerformed = false;
    }
}