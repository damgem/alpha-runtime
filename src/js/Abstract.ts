import { NumericOperation } from "./ParserTreeNodes";

export interface Evalueateable<V,RA,RV,RL> {
    evaluate(r: Runtime<RA,RV,RL>): V;
}

export interface Register<V,RA,RV,RL> extends Evalueateable<V,RA,RV,RL> {
    set(value: V, r: Runtime<RA,RV,RL>): void;
}

export interface Executable<A,V,L> {
    execute(r: Runtime<A,V,L>): void;
}

export interface Stack<V> {
    push(value: V): void;
    pop(): V;
}

export class Memory<A, V> {
    static register(target: any): void {};
    set(address: A, value: V): void {};
    get(address: A): V {throw 1;};
}

export interface ProgramMemory<A,V,L> {
    register(lineNumber: number, executeable: Executable<A,V,L>, label: L): void;
}

export default interface Runtime<A, V, L> {
    programMemory: ProgramMemory<A,V,L>;
    memory: Memory<A, V>;
    stack: Stack<V>;
    
    goto(label: L): void;
    return(): void;
    call(label: L): void;
}

class Stack

@Memory.register
class x {

}