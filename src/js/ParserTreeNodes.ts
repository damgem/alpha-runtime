import {Value, Address, Label, val2addr, RuntimeEnv, Evalueateable, Operation, Register, Executable} from "./Skeleton";
import AbstractOperation from "./AbstractOperation";
import {ExecutionError, SyntaxError, ExecutionEnd} from "./ExecutionError";

// ---- Constant ----
export class Constant<T> implements Evalueateable<T>{
    private value: T;
    constructor(value: T) {this.value = value;}
    evaluate() {return this.value;}
}

// ---- Register ----
export class MemoryRegister implements Register  {
    private address: Evalueateable<Value>;
    constructor(address: Evalueateable<Value>) {this.address = address;}

    evaluate(re: RuntimeEnv) {
        return re.getMemory(val2addr(this.address.evaluate(re)));
    }

    set(value: number, re: RuntimeEnv) {
        re.setMemory(String(this.address.evaluate(re)), value);
    }
}

export class Accumulator implements Register {
    evaluate(re: RuntimeEnv) {return re.getAccumulator();}
    set(value: Value, re: RuntimeEnv){re.setAccumulator(value);}
}

export class StackTop implements Register {
    evaluate(re: RuntimeEnv) {return re.stackPop();}
    set(value: Value, re: RuntimeEnv){re.stackPush(value);}

// ---- Operations ----
type NumericOperator = '+' | '-' | '*' | '/' | '%';
export class NumericOperation extends AbstractOperation<NumericOperator, Value, Value> {
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
export class BooleanOperation extends AbstractOperation<BooleanOperator, Value, boolean> {
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
export class GotoStatement implements Executable {
    label: Evalueateable<Value>
    constructor(label: Evalueateable<Value>) {this.label = label;}
    execute(re: RuntimeEnv) {
        re.goto(this.label.evaluate(re));
    }
}

export class CallStatement extends GotoStatement {
    execute(re: RuntimeEnv) {
       re.call(this.label.evaluate(re));
    }
}

export class AssignStatement implements Executable {
    private register: Register;
    private value: Evalueateable<number>;

    constructor(register: AST.Register, value: AST.Evalueateable<number>) {
        this.register = register;
        this.value = value;
    }

    execute(re: RuntimeEnv) {this.register.set(this.value.evaluate(re), re);}
}

export class IfStatement implements AST.Executable {
    private condition: AST.Evalueateable<boolean>;
    private code: AST.Executable;

    constructor(condition: AST.Evalueateable<boolean>, code: AST.Executable) {
        this.condition = condition;
        this.code = code;
    }

    execute(re: RuntimeEnv) {if(this.condition.evaluate(re)) this.code.execute(re);}
}

export class ReturnStatement implements AST.Executable {
    execute(re: RuntimeEnv) {
        if(re.stack.isEmpty) {
            re.isRunning = false;
            return;
        }
        re.instructionCounter = re.stack.pop();
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

export class NumericStackOperationStatement extends NumericOperation implements AST.Executable {
    constructor(operator: NumericOperator) {
        super(operator, new StackTop(), new StackTop());
    }
    
    execute(re: RuntimeEnv) {
        if(re.stack.size < 2) throw new Error("Cannot execute stack operation with less than 2 elements on the stack");
        re.stack.push(super.evaluate(re));
    }
}

export class BooleanStackOperationStatement extends BooleanOperation implements AST.Executable {
    constructor(operator: BooleanOperator) {
        super(operator, new StackTop(), new StackTop());
    }
    
    execute(re: RuntimeEnv) {
        if(re.stack.size < 2) throw new Error("Cannot execute stack operation with less than 2 elements on the stack");
        re.stack.push(super.evaluate(re) ? 1 : 0);
    }
}

// ---- CodeLine ----
export class CodeLine implements AST.Executable {
    public readonly label?: string;
    private code: AST.Executable;

    constructor(label: string | undefined, code: AST.Executable) {
        this.label = label?.trim();
        if(this.label == "") this.label = undefined;
        this.code = code;
    }
    
    execute(re: RuntimeEnv) {this.code.execute(re);}
}
