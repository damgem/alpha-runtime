export type NumericValue = number;
export type Value = NumericValue | string;

export interface Evalueateable<ValueType> {
    evaluate(): ValueType;
}

export interface Register {
    read(): NumericValue;
    write(value: NumericValue): void;
}

export interface Operation extends Evalueateable<NumericValue>{
    left: Evalueateable<NumericValue>;
    right: Evalueateable<NumericValue>;
}

export interface Executable {
    execute(): void;
}
