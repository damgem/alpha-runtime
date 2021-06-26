import * as AST from "./AbstractTreeNodes";
import AbstractOperation from "./AbstractOperation";
import RuntimeEnv from "./RuntimeEnv";
import {ExecutionError, SyntaxError, ExecutionEnd} from "./ExecutionError";

// ---- Constant ----
export class Constant<ValueType> implements AST.Evalueateable<ValueType>{
    private value: ValueType;
    constructor(value: ValueType) {this.value = value;}

    evaluate() {return this.value;}
}

// ---- Register ----
export class MemoryRegister implements AST.Register  {
    private address: AST.Evalueateable<AST.Value>;
    constructor(address: AST.Evalueateable<AST.Value>) {this.address = address;}

    evaluate(re: RuntimeEnv) {
        return re.memory.get(String(this.address.evaluate(re)));
    }

    set(value: number, re: RuntimeEnv) {
        re.memory.set(String(this.address.evaluate(re)), value);
    }
}

export class Accumulator implements AST.Register {
    evaluate(re: RuntimeEnv) {return re.accumulator;}
    set(value: number, re: RuntimeEnv){re.accumulator = value;}
}

// ---- Operations ----
type NumericOperator = '+' | '-' | '*' | '/' | '%';
export class NumericOperation extends AbstractOperation<NumericOperator, number> {
    evaluate(re: RuntimeEnv) {
        let l = this.left.evaluate(re);
        let r = this.right.evaluate(re);
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
    evaluate(re: RuntimeEnv) {
        let l = this.left.evaluate(re);
        let r = this.right.evaluate(re);
        switch(this.operator) {
            case '=':  return l === r;
            case '>':  return l > r;
            case '>=': return l >= r;
            case '<':  return l < r;
            case '<=': return l <= r;
        }
    }
}

// ---- Statements ----
export class GotoStatement implements AST.Executable {
    label: AST.Evalueateable<AST.Value>
    constructor(label: AST.Evalueateable<AST.Value>) {this.label = label;}

    execute(re: RuntimeEnv) {
        let labelValue = this.label.evaluate(re);
        if(typeof(labelValue) === 'number') labelValue = String(labelValue);
        if(!(labelValue in re.labels)) throw new ExecutionError(`Undefined Label ${labelValue}`);
        re.instructionCounter = re.labels[labelValue];
    }
}

export class CallStatement extends GotoStatement {
    execute(re: RuntimeEnv) {
        re.stack.push(re.instructionCounter);
        super.execute(re);
    }
}

export class AssignStatement implements AST.Executable {
    private register: AST.Register;
    private value: AST.Evalueateable<number>;

    constructor(register: AST.Register, value: AST.Evalueateable<number>) {
        this.register = register;
        this.value = value;
    }

    execute(re: RuntimeEnv) {this.register.set(this.value.evaluate(re), re);}
}

export class IfStatement implements AST.Executable {
    private condition: BooleanOperation;
    private code: AST.Executable;

    constructor(condition: BooleanOperation, code: AST.Executable) {
        this.condition = condition;
        this.code = code;
    }

    execute(re: RuntimeEnv) {if(this.condition.evaluate(re)) this.code.execute(re);}
}

export class ReturnStatement implements AST.Executable {
    execute(re: RuntimeEnv) {
        let returnAddress = re.stack.pop();
        // end execution when final return is requested
        if(returnAddress === undefined) throw new ExecutionEnd();
        re.instructionCounter = returnAddress;
    }
}

export class PushStatement implements AST.Executable {
    private value: AST.Evalueateable<number>;
    constructor(value?: AST.Evalueateable<number>) {this.value = value ?? new Accumulator();}

    execute(re: RuntimeEnv) {re.stack.push(this.value.evaluate(re));}
}

export class PopStatement implements AST.Executable {
    private register: AST.Register;
    constructor(register: AST.Register) {this.register = register ?? new Accumulator();}

    execute(re: RuntimeEnv) {this.register.set(re.stack.pop(), re);}
}

class StackPopper implements AST.Evalueateable<number> {
    evaluate(re: RuntimeEnv) {return re.stack.pop();}
}

export class StackOperationStatement implements AST.Executable {
    private operation: NumericOperation;
    constructor(operator: NumericOperator) {this.operation = new NumericOperation(operator, new StackPopper(), new StackPopper());}
    
    execute(re: RuntimeEnv) {
        if(re.stack.size < 2) throw new Error("Cannot execute stack operation with less than 2 elements on the stack");
        re.stack.push(this.operation.evaluate(re));
    }
}

// ---- CodeLine ----
export class CodeLine implements AST.Executable {
    public readonly label?: string;
    private code: AST.Executable;

    constructor(label: string | undefined, code: AST.Executable) {
        this.label = label;
        this.code = code;
    }
    
    execute(re: RuntimeEnv) {this.code.execute(re);}
}