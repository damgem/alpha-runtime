import { Executable } from './AbstractTreeNodes';
import {StackCallback, MapCallback, OberservableStack, OberservableMap} from './Observables';

type onChangeCallback<T> = (oldValue: T, newValue: T) => void;

export interface RuntimeCallbacks {
    onStackPush?: StackCallback<number>;
    onStackPop?:  StackCallback<number>;
    onMemoryInsert?: MapCallback<string, number>;
    onMemoryChange?: MapCallback<string, number>;
    onIsRunningChange?: onChangeCallback<boolean>
    onAccumulatorChange?: onChangeCallback<number>
    onInstructionPointerChange?: onChangeCallback<number>
}

export default class RuntimeCore {

    public constructor(callbacks: RuntimeCallbacks) {
        this.stack = new OberservableStack(callbacks.onStackPush, callbacks.onStackPop);
        this.memory = new OberservableMap(callbacks.onMemoryInsert, callbacks.onMemoryChange);
        this.callbacks = callbacks;
    }
    
    private _isRunning: boolean = true;
    private _accumulator: number = 0;
    private _instructionCounter: number = 0;
    private callbacks: RuntimeCallbacks;
    
    public instructionPointerNext: number | undefined = undefined;
    
    public labels: {[label: string] : number} = {};
    public stack: OberservableStack<number>;
    public memory: OberservableMap<string, number>;

    public get isRunning(): boolean         {return this._isRunning;};
    public get accumulator(): number        {return this._accumulator;}

    /**
     * Readonly access to the instruction pointer. This pointer keeps track whick code line to execute next.
     * The codelines themselves are not contained in the RuntimeCore but instead in 
     */
    public get instructionPointer(): number {return this._instructionCounter;}

    /**
     * Changes the running status of the runtime.
     * Calls the `onIsRunningChange` function if specified during construction.
     */
    public set isRunning(value: boolean) {
        if(value == this._isRunning) return;
        this.callbacks.onIsRunningChange?.(this._isRunning, value);
        this._isRunning = value;
    };

    /**
     * Sets the value of the accumulator.
     * Calls the `onAccumulatorChange` function if specified during construction.
     */
    public set accumulator(value: number) {
        if(value == this._accumulator) return;
        this.callbacks.onAccumulatorChange?.(this._accumulator, value);
        this._accumulator = value;
    }

    /**
     * Changes the instruction pointer to the next instruction address.
     * Returns false if goto statement was executed since last call. If instruction pointer was incremented naturally this will return true.
     * @returns boolean wether instruction pointer was incremented naturally
     */
    public finishStatement() {

        if(this.instructionPointerNext === undefined) {
            this.callbacks.onInstructionPointerChange?.(this._instructionCounter, this._instructionCounter+1);
            this._instructionCounter++;
            return true;
        }

        this.callbacks.onInstructionPointerChange?.(this._instructionCounter, this.instructionPointerNext);
        this._instructionCounter = this.instructionPointerNext;
        this.instructionPointerNext = undefined;
        return false;
    }
    
    /**
     * Throws an error with value of the instruction pointer. This is useful to know on which line the error occurred.
     * If error is a string, a new Error will be created containing that message.
     * If error is an Error object, the existing message will be complemented the instruction pointer value.
     * @param error error message or error object
     */
    public error(error: string | Error) : never {
        if(!(error instanceof Error)) {
            error = Error(error);
        }
        error.message = `Execution Error at line ${this.instructionPointer}: ${error.message}`;
        throw error;
    }

    public log(msg: string) {
        console.log(`From line ${this.instructionPointer}: ${msg}`);
    }
};