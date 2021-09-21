import Memory from "./Memory";
import CodeManager from "./CodeManager";
import { CodeLine } from "./ASTNodes";
import Stack, { OnStackChangeEventType } from "./Stack";

export class RuntimeCallbacks {
    onMemoryWrite?: (writeAddress: String, newValue: Number, wasInitialized: boolean) => void
    onStackChange?: (value: number, type: OnStackChangeEventType) => void
    onCallStackChange?: (value: number, type: OnStackChangeEventType) => void
    onInstructionPointerChange?: (value: number) => void
    onProgramEnd?: () => void
}

/**
 * Runtime that contains memory, stacks a instruction pointer and more. 
 */
export default class Runtime {

    /**
     * Creates a new Runtime instance.
     * @param statements the program that runs in this environment
     * @param callbacks callbacks for on change events
     */
    public constructor(statements: CodeLine[], callbacks: RuntimeCallbacks) {
        this.memory = new Memory(callbacks.onMemoryWrite);
        
        this.stack = new Stack(callbacks.onStackChange);
        this.callStack = new Stack(callbacks.onCallStackChange);
    
        this.codeManager = new CodeManager(statements, callbacks.onInstructionPointerChange, callbacks.onProgramEnd);
    }

    /**
     * Memory for register.
     */
    public memory: Memory;

    /**
     * Stack that the user can push to / pop from.
     */
    public stack: Stack<number>;

    /**
     * Call stack to keep track where to jump back to after returning.
     */
    public callStack: Stack<number>;

    /**
     * Code Manager that manages the instruction pointer among other things.
     */
    public codeManager: CodeManager;

    /**
     * Returns a snapshot of the internal memory and stack state.
     * @returns snapshot
     */
    public getSnapshot()
    {
        return {
            memory: this.memory.getSnapshot(),
            stack: this.stack.getSnapshot()
        }
    }
}