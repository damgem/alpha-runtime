export type StackCallback<T> = (index: number, value: T) => void;

export class OberservableStack<T> {

    private stack: T[] = [];
    private onPush?: StackCallback<T>;
    private onPop?: StackCallback<T>;

    constructor(onPush?: StackCallback<T>, onPop?: StackCallback<T>) {
        this.onPush = onPush;
        this.onPop = onPop;
    }
    
    public get isEmpty(): boolean {
        return this.stack.length === 0;
    }

    public get size(): number {
        return this.stack.length;
    }

    public get top(): T {
        if(this.isEmpty) throw new Error("Cannot peek on empty stack!");
        return this.stack[this.stack.length-1];
    }

    public push(value: T): void {
        this.onPush?.(this.stack.length, value);
        this.stack.push(value);
    }

    public pop(): T {
        let value = this.stack.pop();
        if(value === undefined) throw new Error("Cannot pop from empty stack!");
        this.onPop?.(this.stack.length-1, value);
        return value;
    }

    public clear(): void {
        if(this.onPush) {
            for(let si = this.stack.length-1; si >= 0; si--){
                this.onPush(si, this.stack[si]);
            }
        }
        this.stack.length = 0;
    }
}



export type MapCallback<K, V> = (key: K, value: V) => void;

export class OberservableMap<K, V> {
    
    private map: Map<K, V> = new Map();

    private onInsert?: MapCallback<K, V>;
    private onChange?: MapCallback<K, V>;
    private onDelete?: MapCallback<K, V>;

    constructor(onInsert?: MapCallback<K, V>, onChange?: MapCallback<K, V>, onDelete?: MapCallback<K, V>) {
        this.onInsert = onInsert;
        this.onChange = onChange;
        this.onDelete = onDelete;
    }
    
    public has(key: K): boolean {
        return this.map.has(key);
    }

    public get(key: K): V {
        let value = this.map.get(key);
        if(value === undefined) throw new Error(`Map has no key ${key}!`);
        return value;
    }

    public set(key: K, value: V): void {
        (this.has(key) ? this.onChange : this.onInsert)?.(key, value);
        this.map.set(key, value);
    }

    public delete(key: K): boolean {        
        this.onDelete?.(key, this.get(key));
        return this.map.delete(key);
    }

}