import RuntimeEnv from "./SimpleRuntimeEnv";

export type Value = number | string;

export interface Evalueateable<ValueType> {
    evaluate(re: RuntimeEnv): ValueType;
}

export interface Register extends Evalueateable<number> {
    set(value: number, re: RuntimeEnv): void;
}

export interface Operation extends Evalueateable<number>{
    left: Evalueateable<number>;
    right: Evalueateable<number>;
}

export interface Executable {
    execute(re: RuntimeEnv): void;
}
