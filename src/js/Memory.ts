/**
 * Simple Memory model with on write callback support.
 */
export default class Memory {
    
    /**
     * Constructs a new Memory instance
     * @param onWrite value for {@link onWrite} callback
     */
    constructor(onWrite?: (writeAddress: String, newValue: Number, wasInitialized: boolean) => void) {
        this.onWrite = onWrite;
    }

    /**
     * Callback that gets triggered by {@link onWrite}.
     * @param writeAddress is the adress that is being written to
     * @param newValue is the new value that is being written
     * @param initialized `true` if the memory cell was initialized before (i.e. contained a value before)
     */
    public onWrite?: (writeAddress: String, newValue: Number, wasInitialized: boolean) => void;

    /**
     * Checks wether the memory cell is already initialized, i.e. contains a
     * value and can be read without an {@link UnitializedAccessError}.
     * @param address address of memory cell
     * @returns `true` if the memory cell is already initialized 
     */
    public isInitialized(address: string): boolean {
        return this.memoryCells.has(address);
    }

    /**
     * Reads the value of a memory cell.
     * @param address the address of the memory cell
     * @returns the value of the memory cell
     * @throws {@link UnitializedAccessError} if memory cell has not been initialized
     * @see {@link isInitialized}
     */
    public read(address: string): number {
        let value = this.memoryCells.get(address);
        if(value === undefined) throw new UnitializedAccessError(address);
        return value;
    }

    /**
     * Writes a value to a memory cell. Triggers the `onWrite` callback.
     * @param address the address of the memory cell
     * @param value the value that is being written to the memory cell
     */
    public write(address: string, value: number): void {
        const isInit = this.isInitialized(address);
        this.memoryCells.set(address, value);
        this.onWrite?.(address, value, isInit);
    }

    // map that stores memory cell values
    protected memoryCells: Map<string, number> = new Map();
}


export class UnitializedAccessError extends Error {
    address: String;
    public constructor(address: String) {
        super(`Access to uninitialized memory "${address}"`)
        this.address = address;
    }
}