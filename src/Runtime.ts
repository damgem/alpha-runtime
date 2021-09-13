import Memory from "./Memory";
import CodeManager from "./CodeManager";
import LineStatement from "./LineStatement";
import Stack, { OnStackChangeEventType } from "./Stack";

export class RuntimeCallbacks {
    onMemoryWrite?: (writeAddress: String, newValue: Number, wasInitialized: boolean) => void
    onSpecialMemoryWrite?: (writeAddress: String, newValue: Number, wasInitialized: boolean) => void
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
    public constructor(statements: LineStatement[], callbacks: RuntimeCallbacks) {
        this.memory = new Memory(callbacks.onMemoryWrite);
        this.specialMemory = new Memory(callbacks.onSpecialMemoryWrite);
        
        this.stack = new Stack(callbacks.onStackChange);
        this.callStack = new Stack(callbacks.onCallStackChange);
    
        this.codeManager = new CodeManager(statements, callbacks.onInstructionPointerChange, callbacks.onProgramEnd);
    }

    /**
     * Memory for default register.
     */
    public memory: Memory;

    /**
     * Memory for special register like accumulators and such.
     */
    public specialMemory: Memory;

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
}