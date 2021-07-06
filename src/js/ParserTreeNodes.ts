import * as AST from "./AbstractTreeNodes";
import AbstractOperation from "./AbstractOperation";
import Runtime from "./RuntimeInterface";
import {ExecutionError, SyntaxError, ExecutionEnd} from "./ExecutionError";

// ---- Constant ----
export class Constant<ValueType> implements AST.Evalueateable<ValueType>{
    private value: ValueType;
    constructor(value: ValueType) {this.value = value;}

    evaluate(re?: Runtime) {return this.value;}
}

// ---- Register ----
export class MemoryRegister implements AST.Register  {
    private address: AST.Evalueateable<AST.Value>;
    constructor(address: AST.Evalueateable<AST.Value>) {this.address = address;}

    evaluate(re: Runtime) {
        return re.memory.get(String(this.address.evaluate(re)));
    }

    set(value: number, re: Runtime) {
        re.memory.set(String(this.address.evaluate(re)), value);
    }
}

export class Accumulator implements AST.Register {
    evaluate(re: Runtime) {return re.accumulator;}
    set(value: number, re: Runtime){re.accumulator = value;}
}

export class StackTop implements AST.Register {
    evaluate(re: Runtime) {return re.stack.pop();}
    set(value: number, re: Runtime){re.stack.push(value);}
}

// ---- Operations ----
type NumericOperator = '+' | '-' | '*' | '/' | '%';
export class NumericOperation extends AbstractOperation<NumericOperator, number, number> {
    evaluate(re: Runtime) {
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
export class BooleanOperation extends AbstractOperation<BooleanOperator, number, boolean> {
    evaluate(re: Runtime) {
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

    execute(re: Runtime) {
        let labelValue = this.label.evaluate(re);
        if(typeof(labelValue) === 'number') {
            re.instructionPointer = labelValue;
            return;
        }
        if(!(labelValue in re.labels))
            throw new ExecutionError(`Undefined Label ${labelValue}`);
        re.instructionPointer = re.labels[labelValue];
    }
}

export class CallStatement extends GotoStatement {
    execute(re: Runtime) {
        re.stack.push(re.instructionPointer);
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

    execute(re: Runtime) {this.register.set(this.value.evaluate(re), re);}
}

export class IfStatement implements AST.Executable {
    private condition: AST.Evalueateable<boolean>;
    private code: AST.Executable;

    constructor(condition: AST.Evalueateable<boolean>, code: AST.Executable) {
        this.condition = condition;
        this.code = code;
    }

    execute(re: Runtime) {if(this.condition.evaluate(re)) this.code.execute(re);}
}

export class ReturnStatement implements AST.Executable {
    execute(re: Runtime) {
        if(re.stack.isEmpty) {
            re.isRunning = false;
            return;
        }
        re.instructionPointer = re.stack.pop();
    }
}

export class PushStatement implements AST.Executable {
    private value: AST.Evalueateable<number>;
    constructor(value?: AST.Evalueateable<number>) {this.value = value ?? new Accumulator();}

    execute(re: Runtime) {re.stack.push(this.value.evaluate(re));}
}

export class PopStatement implements AST.Executable {
    private register: AST.Register;
    constructor(register: AST.Register) {this.register = register ?? new Accumulator();}

    execute(re: Runtime) {this.register.set(re.stack.pop(), re);}
}

export class NumericStackOperationStatement extends NumericOperation implements AST.Executable {
    constructor(operator: NumericOperator) {
        super(operator, new StackTop(), new StackTop());
    }
    
    execute(re: Runtime) {
        if(re.stack.size < 2) throw new Error("Cannot execute stack operation with less than 2 elements on the stack");
        re.stack.push(super.evaluate(re));
    }
}

export class BooleanStackOperationStatement extends BooleanOperation implements AST.Executable {
    constructor(operator: BooleanOperator) {
        super(operator, new StackTop(), new StackTop());
    }
    
    execute(re: Runtime) {
        if(re.stack.size < 2) throw new Error("Cannot execute stack operation with less than 2 elements on the stack");
        re.stack.push(super.evaluate(re) ? 1 : 0);
    }
}

// ---- CodeLine ----
export class CodeLine implements AST.Executable {
    public readonly label?: string;
    private code: AST.Executable;

    constructor(code: AST.Executable, label?: string) {
        if(typeof label === "string"){
            this.label = label.trim();
        }
        this.code = code;
    }
    
    execute(re: Runtime) {this.code.execute(re);}
}