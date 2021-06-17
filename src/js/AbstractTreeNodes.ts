export type Value = number | string;

export interface Evalueateable<ValueType> {
    evaluate(): ValueType;
}

export interface Register extends Evalueateable<number> {
    set(value: number): void;
}

export interface Operation extends Evalueateable<number>{
    left: Evalueateable<number>;
    right: Evalueateable<number>;
}

export interface Executable {
    execute(): void;
}
