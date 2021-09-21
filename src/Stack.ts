import { NULL_LOCATION, RuntimeError } from "./Errors";

/**
 * Simple Stack that supports on push and on pop callbacks.
 */
export default class Stack<T>
{
    /**
     * Constructs a new Stack instance
     * @param onChange value for {@link onChange} callback 
     */
    constructor(onChange?: (value: T, type: OnStackChangeEventType) => void) {
        this.onChange = onChange;
    }   

    /**
     * Callback that gets triggered by {@link push} and {@link push}.
     * @param value the value that is being pushed / popped
     * @param type type of change
     */
    public onChange?: (value: T, type: OnStackChangeEventType) => void;
    
    /**
     * Property that is `true` if the stack holds no elements.
     */
    public get isEmpty(): boolean {
        return this.length === 0;
    }

    /**
     * Length of the stack.
     */
    public get length(): number {
        return this.stack.length;
    }

    /**
     * Pushes a value ontop the a stack. Triggers {@link onChange}.
     * @param value value to push
     */
    public push(value: T): void {
        this.stack.push(value);
        this.onChange?.(value, OnStackChangeEventType.PUSH);
    }

    /**
     * Pops a value from the stacks. Triggers {@link onPop}.
     * @returns value that has been popped
     */
    public pop(): T {
        let value = this.stack.pop();
        if(value === undefined) throw new RuntimeError(NULL_LOCATION, 'Tries to pop from empty stack');
        this.onChange?.(value, OnStackChangeEventType.POP);
        return value;
    }

    /**
     * Returns a copy of the internal stack which is realized as an array.
     * @returns array
     */
    getSnapshot()
    {
        return [...this.stack];
    }

    private stack: T[] = [];
}

export enum OnStackChangeEventType {
    PUSH,
    POP
}