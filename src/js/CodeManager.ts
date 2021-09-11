import LineStatement from "./LineStatement";

export default class CodeManager {

    public onInstructionPointerChange?: (value: number) => void;
    public onFinish?: () => void;

    public constructor(statements: LineStatement[], onInstructionPointerChange?: (value: number) => void, onFinish?: () => void) {
        this.setStatements(statements);
        this.onInstructionPointerChange = onInstructionPointerChange;
        this.onFinish = onFinish;
    }

    public setStatements(statements: LineStatement[]) {
        this.statements = statements;

        this.isFinished = this.instructionPointer < this.statements.length;

        this.labelMap.clear();
        for(let si = 0; si < this.statements.length; si++) {
            let label = this.statements[si].label;
            if(label !== undefined) {
                if(this.labelMap.has(label)) {
                    throw new Error(`Duplicate labels ${label}`);
                }
                this.labelMap.set(label, si);
            }
        }
    }

    public advanceInstructionPointer() { 
        if(this.nextInstructionPointer !== undefined) {
            this.instructionPointer = this.nextInstructionPointer;
            this.nextInstructionPointer = undefined;
        } else {
            this.instructionPointer += 1;
            if(this.instructionPointer >= this.statements.length) {
                this.finish();
                return;
            }
        }
        this.onInstructionPointerChange?.(this.instructionPointer);
    }

    public planJump(address: number | string) {
        if(typeof address == 'string') {
            address = this.resolveLabel(address);
        } else if(address < 0 || address >= this.statements.length) {
            throw new Error(`Jump to invalid line: ${address}`);
        }
        console.assert(this.nextInstructionPointer === undefined, 'Instruction Pointer nextValue not cleared?');
        this.nextInstructionPointer = address;
    }
    
    public finish() {
        this.isFinished = true;
        this.onFinish?.();
    }

    private resolveLabel(label: string): number {
        let num = this.labelMap.get(label);
        if(num === undefined) {
            throw new Error(`Label not found: ${label}`);
        }
        return num;
    }

    private statements: LineStatement[] = [];
    private labelMap: Map<string, number> = new Map<string, number>();

    private instructionPointer: number = 0;
    private nextInstructionPointer?: number = undefined;
    private isFinished = false;
}