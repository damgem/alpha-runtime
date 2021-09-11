import LineStatement from "./LineStatement";

/**
 * Code Manager that mainly keeps track of what the next statement is.
 */
export default class CodeManager
{
    /**
     * Callback that gets triggered when the instruction pointer is changed.
     * {@link advanceInstructionPointer} can trigger this even when a planned
     * jump results the intruction pointer to point to the same line.
     */
    public onInstructionPointerChange?: (value: number) => void;

    /**
     * Callback that gets triggered when this program is halted.
     * This can potentially be triggered by {@link advanceInstructionPointer}
     * or directly by {@link halt}.
     */
    public onHalt?: () => void;

    /**
     * Creates a new CodeManager instance.
     * @param statements 
     * @param onInstructionPointerChange value for
     * {@link onInstructionPointerChange} callback
     * @param onHalt value for {@link onHalt} callback
     */
    public constructor(statements: LineStatement[],
                       onInstructionPointerChange?: (value: number) => void,
                       onHalt?: () => void)
    {
        this.setStatements(statements);
        this.onInstructionPointerChange = onInstructionPointerChange;
        this.onHalt = onHalt;
    }

    /**
     * Sets the program. Regenerates the internal properties {@link labelMap}
     * and {@link isRunning} (but never triggers {@link onHalt}).
     * @param statements Program that is executed in this environment
     */
    public setStatements(statements: LineStatement[])
    {
        this.statements = statements;
        this.isRunning = this.instructionPointer < this.statements.length;
        this.generateLabelMap();
    }

    /**
     * Advances the instruction pointer to the next statement.
     * The next statement is the statement planned by {@link planJump} or if
     * none is planned the statement in the next line.
     * @returns 
     */
    public advanceInstructionPointer()
    { 
        if(this.nextInstructionPointer !== undefined)
        {
            this.instructionPointer = this.nextInstructionPointer;
            this.nextInstructionPointer = undefined;
        }
        else
        {
            this.instructionPointer += 1;
            if(this.instructionPointer >= this.statements.length)
            {
                this.halt(); // will trigger onHalt
                return;      // so don't trigger onInstructionPointerChange
            }
        }

        this.onInstructionPointerChange?.(this.instructionPointer);
    }

    /**
     * Plans a jump of the address pointer. Multiple calls will overwrite each
     * other with only the last call being planned. Jump will be executed and 
     * cleared by the next {@link advanceInstructionPointer} call.
     * @param address line number or label to jump to
     */
    public planJump(address: number | string)
    {
        if(typeof address == 'string')
        {
            address = this.resolveLabel(address);
        }
        else if(address < 0 || address >= this.statements.length)
        {
            throw new Error(`Jump to invalid line: ${address}`);
        }

        console.assert(this.nextInstructionPointer === undefined,
                       'Instruction Pointer nextValue not cleared?');

        this.nextInstructionPointer = address;
    }
    
    /**
     * Halts the program. Will trigger {@link onHalt}.
     */
    public halt()
    {
        this.isRunning = false;
        this.onHalt?.();
    }

    private resolveLabel(label: string): number
    {
        let num = this.labelMap.get(label);

        if(num === undefined)
        {
            throw new Error(`Label not found: ${label}`);
        }

        return num;
    }

    private generateLabelMap() {
        this.labelMap.clear();

        for(let si = 0; si < this.statements.length; si++)
        {
            let label = this.statements[si].label;

            if(label !== undefined)
            {
                if(this.labelMap.has(label))
                {
                    throw new Error(`Duplicate labels ${label}`);
                }
                this.labelMap.set(label, si);
            }
        }
    }

    private isRunning = true;

    private statements: LineStatement[] = [];
    private labelMap: Map<string, number> = new Map<string, number>();

    private instructionPointer: number = 0;
    
    // keep track of planned jumps
    // if undefined no jump has been planned
    private nextInstructionPointer?: number = undefined;
}