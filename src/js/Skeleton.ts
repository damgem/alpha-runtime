export type Value = number;
export type Address = number | string;
export type Label = string;
export type Conditional = boolean;

export function val2addr(x: Value) {return String(x);}

export interface RuntimeEnv {
    goto(label: Label): void;
    call(label: Label): void;
    return(): void;
    stackPop(): Value;
    stackPush(): Value;
    getAccumulator(): Value;
    setAccumulator(value: Value): void;
    getMemory(address: Address): Value;
    setMemory(address: Address, value: Value): void;
};

export interface Evalueateable<T> {
    evaluate(re: RuntimeEnv): T;
}

export interface Register extends Evalueateable<Value> {
    set(value: Value, re: RuntimeEnv): void;
}

export interface Operation<T> extends Evalueateable<T>{
    left: Evalueateable<T>;
    right: Evalueateable<T>;
}

export interface Executable {
    execute(re: RuntimeEnv): void;
}
