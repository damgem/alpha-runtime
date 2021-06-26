import {StackCallback, MapCallback, OberservableStack, OberservableMap} from './Observables';

type onChangeCallback<T> = (oldValue: T, newValue: T) => void;

interface RuntimeEnvCallbacks {
    onStackPush?: StackCallback<number>;
    onStackPop?:  StackCallback<number>;
    onMemoryInsert?: MapCallback<string, number>;
    onMemoryChange?: MapCallback<string, number>;
    onIsRunningChange?: onChangeCallback<boolean>
    onAccumulatorChange?: onChangeCallback<number>
    onInstructionPointerChange?: onChangeCallback<number>
}

export default class RuntimeEnv {

    public constructor(callbacks: RuntimeEnvCallbacks) {
        this.stack = new OberservableStack(callbacks.onStackPush, callbacks.onStackPop);
        this.memory = new OberservableMap(callbacks.onMemoryInsert, callbacks.onMemoryChange);
        this.callbacks = callbacks;
    }
    
    private _isRunning: boolean = false;
    private _accumulator: number = 0;
    private _instructionCounter: number = 0;
    private callbacks: RuntimeEnvCallbacks;
    
    protected gotoPerformed = false;

    public labels: {[label: string] : number} = {};
    public stack: OberservableStack<number>;
    public memory: OberservableMap<string, number>;

    public get isRunning(): boolean         {return this._isRunning;};
    public get accumulator(): number        {return this._accumulator;}
    public get instructionCounter(): number {return this._instructionCounter;}

    public set isRunning(value: boolean) {
        if(value == this._isRunning) return;
        this.callbacks.onIsRunningChange?.(this._isRunning, value);
        this._isRunning = value;
    };

    public set accumulator(value: number) {
        if(value == this._accumulator) return;
        this.callbacks.onAccumulatorChange?.(this._accumulator, value);
        this._accumulator = value;
    }

    public set instructionCounter(value: number) {
        if(this.gotoPerformed) this.error("moving instrction counter twice without ending previous code line!");
        this.gotoPerformed = true;
        this.callbacks.onInstructionPointerChange?.(this._instructionCounter, value);
        this._instructionCounter = value;
    }

    public error(msg: string) {
        console.warn(msg);
    }

    public log(msg: string) {
        console.log(msg);
    }
};