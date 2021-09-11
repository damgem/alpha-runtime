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

export default class Runtime {
    public constructor(statements: LineStatement[], callbacks: RuntimeCallbacks) {
        this.memory = new Memory(callbacks.onMemoryWrite);
        this.specialMemory = new Memory(callbacks.onSpecialMemoryWrite);
        
        this.stack = new Stack(callbacks.onStackChange);
        this.callStack = new Stack(callbacks.onCallStackChange);
    
        this.codeManager = new CodeManager([], callbacks.onInstructionPointerChange, callbacks.onProgramEnd);
    }

    public memory: Memory;
    public specialMemory: Memory;

    public stack: Stack<number>;
    public callStack: Stack<number>;

    public codeManager: CodeManager;
}