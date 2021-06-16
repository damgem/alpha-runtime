import * as AST from "./AST";
import AbstractOperation from "./AbstractOperation";
import RuntimeEnv from "./RuntimeEnv";

class Constant<ValueType> implements AST.Evalueateable<ValueType>{
    private value: ValueType;
    constructor(value: ValueType) {this.value = value;}
    evaluate() {return this.value;}
}

class MemoryRegister extends RuntimeEnv implements AST.Register  {
    private address: AST.Evalueateable<AST.Value>;
    
    constructor(address: AST.Evalueateable<AST.Value>) {
        super();
        this.address = address;
    }

    read() {
        let addressValue = this.address.evaluate();
        if(typeof(addressValue) === 'number') addressValue = String(addressValue);

        return RuntimeEnv.memory[this.address.evaluate()];
    }

    write(value: number) {
        let addressValue = this.address.evaluate();
        if(typeof(addressValue) === 'number') addressValue = String(addressValue);
        
        RuntimeEnv.memory[addressValue] = value;
    }
}

class Accumulator extends RuntimeEnv implements AST.Register {
    read() {
        return Number(RuntimeEnv.accumulator);
    }
    write(value: number){
        RuntimeEnv.accumulator = value;
    }
}

// ---- Operations ----
type NumericOperator = '+' | '-' | '*' | '/' | '%';
class NumericOperation extends AbstractOperation<NumericOperator, number> {
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
class BooleanOperation extends AbstractOperation<BooleanOperator, boolean> {
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
class GotoStatement extends RuntimeEnv implements AST.Executable {
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

class CallStatement extends GotoStatement {
    execute() {
        RuntimeEnv.stack.push(Number(RuntimeEnv.instructionCounter));
        super.execute();
    }
}

class AssignStatement implements AST.Executable {
    private register: AST.Register;
    private value: AST.Evalueateable<number>;

    constructor(register: AST.Register, value: AST.Evalueateable<number>) {
        this.register = register;
        this.value = value;
    }

    execute() {
        this.register.write(this.value.evaluate());
    }
}

class IfStatement implements AST.Executable {
    private condition: BooleanOperation;
    private code: AST.Executable;

    constructor(condition: BooleanOperation, code: AST.Executable) {
        this.condition = condition;
        this.code = code;
    }

    execute() {
        if(this.condition.evaluate()) this.code.execute();
    }
}

class ReturnStatement extends RuntimeEnv implements AST.Executable {
    execute() {
        let returnAddress = RuntimeEnv.stack.pop();
        // end execution when final return is requested
        if(returnAddress === undefined) throw new ExecutionEnd();
        RuntimeEnv.instructionCounter = returnAddress;
    }
}

class PushStatement extends RuntimeEnv implements AST.Executable {
    register: AST.Register;

    constructor(register: AST.Register) {
        super();
        this.register = register;
    }

    execute() {
        RuntimeEnv.stack.push(this.register.read());
    }
}

class PopStatement extends RuntimeEnv implements AST.Executable {
    register: AST.Register;

    constructor(register: AST.Register) {
        super();
        this.register = register;
    }

    execute() {
        let poppedValue = RuntimeEnv.stack.pop();
        if(poppedValue === undefined) throw new ExecutionError("Cannot pop from empty stack");
        this.register.write(poppedValue);
    }
}