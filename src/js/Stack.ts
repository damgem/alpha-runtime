/**
 * Simple Stack that supports on push and on pop callbacks.
 */
export default class Stack<T> {

    /**
     * Constructs a new Stack instance
     * @param onPush value for {@link onPush} callback 
     * @param onPop value for {@link onPop} callback
     */
    constructor(onPush?: (pushedValue: T) => void, onPop?: (poppedValue: T) => void) {
        this.onPush = onPush;
        this.onPop = onPop;
    }   

    /**
     * Callback that gets triggered by {@link push}
     */
    public onPush?: (pushedValue: T) => void;

    /**
     * Callback that gets triggered by {@link pop}
     */
    public onPop?: (poppedValue: T) => void;
    
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
     * Pushes a value ontop the a stack. Triggers {@link onPush}.
     * @param value value to push
     */
    public push(value: T): void {
        this.stack.push(value);
        this.onPush?.(value);
    }

    /**
     * Pops a value from the stacks. Triggers {@link onPop}.
     * @returns value that has been popped
     */
    public pop(): T {
        let value = this.stack.pop();
        if(value === undefined) throw new PopFromEmptyStackError();
        this.onPop?.(value);
        return value;
    }

    private stack: T[] = [];
}

export class PopFromEmptyStackError extends Error {
    public constructor() {
        super('Cannot pop from empty stack!');
    }
}