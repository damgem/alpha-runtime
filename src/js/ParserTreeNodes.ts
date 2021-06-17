import * as AST from "./AbstractTreeNodes";
import AbstractOperation from "./AbstractOperation";
import RuntimeEnv from "./RuntimeEnv";
import {ExecutionError, SyntaxError, ExecutionEnd} from "./ExecutionError";
import {safeQuerySelector} from "./DOMManipulators";

// ---- Constant ----
export class Constant<ValueType> implements AST.Evalueateable<ValueType>{
    private value: ValueType;
    constructor(value: ValueType) {this.value = value;}
    evaluate() {return this.value;}
}

// ---- Register ----
export class MemoryRegister extends RuntimeEnv implements AST.Register  {
    private address: AST.Evalueateable<AST.Value>;
    
    constructor(address: AST.Evalueateable<AST.Value>) {
        super();
        this.address = address;
    }

    evaluate() {
        let addressValue = this.address.evaluate();
        if(typeof(addressValue) === 'number') addressValue = String(addressValue);

        return RuntimeEnv.memory[this.address.evaluate()];
    }

    set(value: number) {
        let addressValue = this.address.evaluate();
        if(typeof(addressValue) === 'number') addressValue = String(addressValue);
        
        RuntimeEnv.memory[addressValue] = value;
    }
}

export class Accumulator extends RuntimeEnv implements AST.Register {
    evaluate() {return RuntimeEnv.accumulator;}
    set(value: number){RuntimeEnv.accumulator = value;}
}

// ---- Operations ----
type NumericOperator = '+' | '-' | '*' | '/' | '%';
export class NumericOperation extends AbstractOperation<NumericOperator, number> {
    evaluate() {
        let l = this.left.evaluate();
        let r = this.right.evaluate();
        switch(this.operator) {
            case '+': return l + r;
            case '-': return l - r;
            case '*': return l * r;
            case '/': return l / r;
            case '%': return l % r;
        }
    }
}

type BooleanOperator = '=' | '>' | '>=' | '<' | '<=';
export class BooleanOperation extends AbstractOperation<BooleanOperator, boolean> {
    evaluate() {
        switch(this.operator) {
            case '=':  return this.left.evaluate() === this.right.evaluate();
            case '>':  return this.left.evaluate() >   this.right.evaluate();
            case '>=': return this.left.evaluate() >=  this.right.evaluate();
            case '<':  return this.left.evaluate() <   this.right.evaluate();
            case '<=': return this.left.evaluate() <=  this.right.evaluate();
        }
    }
}

// ---- Statements ----
export class GotoStatement extends RuntimeEnv implements AST.Executable {
    label: AST.Evalueateable<AST.Value>

    constructor(label: AST.Evalueateable<AST.Value>) {
        super();
        this.label = label;
    }

    execute() {
        let labelValue = this.label.evaluate();
        if(typeof(labelValue) === 'number') labelValue = String(labelValue);
        if(!(labelValue in RuntimeEnv.labels)) throw new ExecutionError(`Undefined Label ${labelValue}`);
        RuntimeEnv.instructionCounter = RuntimeEnv.labels[labelValue];
    }
}

export class CallStatement extends GotoStatement {
    execute() {
        RuntimeEnv.stack.push(RuntimeEnv.instructionCounter);
        super.execute();
    }
}

export class AssignStatement implements AST.Executable {
    private register: AST.Register;
    private value: AST.Evalueateable<number>;

    constructor(register: AST.Register, value: AST.Evalueateable<number>) {
        this.register = register;
        this.value = value;
    }

    execute() {this.register.set(this.value.evaluate());}
}

export class IfStatement implements AST.Executable {
    private condition: BooleanOperation;
    private code: AST.Executable;

    constructor(condition: BooleanOperation, code: AST.Executable) {
        this.condition = condition;
        this.code = code;
    }

    execute() {if(this.condition.evaluate()) this.code.execute();}
}

export class ReturnStatement extends RuntimeEnv implements AST.Executable {
    execute() {
        let returnAddress = RuntimeEnv.stack.pop();
        // end execution when final return is requested
        if(returnAddress === undefined) throw new ExecutionEnd();
        RuntimeEnv.instructionCounter = returnAddress;
    }
}

export class PushStatement extends RuntimeEnv implements AST.Executable {
    private value: AST.Evalueateable<number>;

    constructor(value: AST.Evalueateable<number>) {
        super();
        this.value = value ?? new Accumulator();
    }

    execute() {RuntimeEnv.stack.push(this.value.evaluate());}
}

export class PopStatement extends RuntimeEnv implements AST.Executable {
    private register: AST.Register;

    constructor(register: AST.Register) {
        super();
        this.register = register ?? new Accumulator();
    }

    execute() {
        let poppedValue = RuntimeEnv.stack.pop();
        if(poppedValue === undefined) throw new ExecutionError("Cannot pop from empty stack");
        this.register.set(poppedValue);
    }
}

class StackPopper extends RuntimeEnv implements AST.Evalueateable<number> {
    evaluate() {
        let poppedValue = RuntimeEnv.stack.pop();
        if(poppedValue === undefined) throw new ExecutionError("Cannot pop from empty stack");
        return poppedValue;
    }
}

export class StackOperationStatement extends RuntimeEnv implements AST.Executable {
    private operation: NumericOperation;

    constructor(operator: NumericOperator) {
        super();
        this.operation = new NumericOperation(operator, new StackPopper(), new StackPopper());
    }
    
    execute() {
        if(RuntimeEnv.stack.length < 2) throw new Error("Cannot execute stack operation with less than 2 elements on the stack");
        RuntimeEnv.stack.push(this.operation.evaluate());
    }
}

// ---- CodeLine ----
export class CodeLine implements AST.Executable {
    
    public readonly label: string | null;
    private code: AST.Executable;

    constructor(label: string | null, code: AST.Executable) {
        this.label = label;
        this.code = code;
    }
    
    execute() {this.code.execute();}
}

// ---- Programm ----
export class Programm extends RuntimeEnv {
    private codeLines: [CodeLine];

    constructor(codeLines: [CodeLine]){
        super();
        this.codeLines = codeLines;
        for(let li: number = 0; li < this.codeLines.length; li++){
            const cl = this.codeLines[li];
            if(cl.label == null) continue;
            if(cl.label in RuntimeEnv.labels) throw new SyntaxError(`Cannot define lable twice ${cl.label}`);
            RuntimeEnv.labels[cl.label] = li;
        };
    }

    step(): boolean {
        if(RuntimeEnv.isDead) return false;
        try {
            this.codeLines[RuntimeEnv.instructionCounter].execute();    
        } catch(ExecutionEnd) {
            RuntimeEnv.isDead = true;
            return false;
        }
        RuntimeEnv.finishCodeLineExecution();
        return true;
    }

    run() {while(this.step) {}}
}