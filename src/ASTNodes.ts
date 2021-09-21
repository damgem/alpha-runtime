import * as AST from "./ASTAbstractNodes" ;
import { Location, NULL_LOCATION } from "./Errors";
import Runtime from "./Runtime";

export class Literal<T> extends AST.Supplier<T>
{
    type = 'Literal';
    private value: T;
    
    public constructor(value: T, loc: Location)
    {
        super(loc);
        this.value = value;
    }
    
    public get(re: Runtime)
    {
        return this.value;
    }
}

export class Register extends AST.Register
{
    type = 'Register';
    private address: AST.Supplier<string | number>;

    public constructor(address: AST.Supplier<string | number>, loc: Location)
    {
        super(loc);
        this.address = address;
    }

    public get(ctx: Runtime)
    {
        const addr = String(this.address.safeGet(ctx));
        return ctx.memory.read(addr);
    }

    public set(value: number, ctx: Runtime)
    {
        const addr = String(this.address.safeGet(ctx));
        ctx.memory.write(addr, value);
    }
}

type CalculationOperator = '+' | '-' | '*' | '/' | '%';
export class Calculation extends AST.Supplier<number>
{
    type = 'Calculation';
    private left: AST.Supplier<number>
    private right: AST.Supplier<number>
    private operator: CalculationOperator

    public constructor(left: AST.Supplier<number>, operator: CalculationOperator, right: AST.Supplier<number>, loc: Location)
    {
        super(loc);
        this.left = left;
        this.right = right;
        this.operator = operator;
    }

    public get(ctx: Runtime) {
        let l = this.left.safeGet(ctx);
        let r = this.right.safeGet(ctx);
        switch(this.operator) {
            case '+': return l + r;
            case '-': return l - r;
            case '*': return l * r;
            case '/': return l / r;
            case '%': return l % r;
        }
    }
}

type ComparisonOperator = '=' | '>' | '>=' | '<' | '<=';
export class Comparison extends AST.Supplier<boolean>
{
    type = 'Comparison';
    private left: AST.Supplier<number>
    private right: AST.Supplier<number>
    private operator: ComparisonOperator

    public constructor(left: AST.Supplier<number>, operator: ComparisonOperator, right: AST.Supplier<number>, loc: Location)
    {
        super(loc);
        this.left = left;
        this.right = right;
        this.operator = operator;
    }

    public get(ctx: Runtime) {
        let l = this.left.safeGet(ctx);
        let r = this.right.safeGet(ctx);
        switch(this.operator) {
            case '=':  return l === r;
            case '>':  return l > r;
            case '>=': return l >= r;
            case '<':  return l < r;
            case '<=': return l <= r;
        }
    }
}

export class StackTop extends AST.Register
{
    type = 'StackTop';
    public constructor()
    {
        super(NULL_LOCATION);
    }

    public get(ctx: Runtime)
    {
        return ctx.stack.pop();
    }

    public set(value: number, ctx: Runtime)
    {
        ctx.stack.push(value);
    }

}

export class Goto extends AST.Executable
{
    type = 'Goto';
    private label: AST.Supplier<number | string>

    public constructor(label: AST.Supplier<number | string>, loc: Location)
    {
        super(loc);
        this.label = label;
    }

    public execute(ctx: Runtime)
    {
        const addr = this.label.safeGet(ctx);
        ctx.codeManager.planJump(addr);
    }
}

export class Call extends Goto
{
    type = 'Call';
    public execute(ctx: Runtime)
    {
        ctx.callStack.push(ctx.codeManager.getInstructionPointer());
        super.execute(ctx);
    }
}

export class Return extends AST.Executable
{
    type = 'Return';
    public constructor(loc: Location) {
        super(loc);
    }

    public execute(ctx: Runtime) {
        const addr = ctx.callStack.pop();
        ctx.codeManager.planJump(addr);
    }
}

export class Definition extends AST.Executable
{
    type = 'Definition';
    private register: AST.Register;
    private value: AST.Supplier<number>;

    public constructor(register: AST.Register, value: AST.Supplier<number>, loc: Location)
    {
        super(loc);
        this.register = register;
        this.value = value;
    }

    public execute(ctx: Runtime)
    {
        const val = this.value.safeGet(ctx);
        this.register.safeSet(val, ctx);
    }
}

export class Conditional extends AST.Executable
{
    type = 'Conditional';
    private condition: AST.Supplier<boolean>;
    private code: AST.Executable;

    constructor(condition: AST.Supplier<boolean>, code: AST.Executable, loc: Location)
    {
        super(loc);
        this.condition = condition;
        this.code = code;
    }

    execute(ctx: Runtime)
    {
        const bool = this.condition.safeGet(ctx);
        if(bool) this.code.safeExecute(ctx);
    }
}

export class StackPush extends AST.Executable
{
    type = 'StackPush';
    private value?: AST.Supplier<number>;

    public constructor(value: AST.Supplier<number> | undefined, loc: Location)
    {
        super(loc);
        this.value = value;
    }

    public execute(ctx: Runtime)
    {
        // maybe we can change this to ctx.memory.read_default for a more configurable env
        const value = this.value?.safeGet(ctx) ?? ctx.memory.read('α');
        ctx.stack.push(value);
    }
}

export class StackPop extends AST.Executable
{
    type = 'StackPop';
    private register: AST.Register | undefined;
    
    public constructor(register: AST.Register | undefined, loc: Location)
    {
        super(loc);
        this.register = register;
    }

    public execute(ctx: Runtime)
    {
        const value = ctx.stack.pop();
        this.register?.safeSet(value, ctx);
    }
}

export class CodeLine extends AST.Executable
{
    type = 'CodeLine';
    public readonly label?: string;
    private statement: AST.Executable;

    public constructor(label: string | undefined, statement: AST.Executable, loc: Location)
    {
        super(loc);
        this.label = label;
        this.statement = statement;
    }

    protected execute(ctx: Runtime)
    {
        this.statement.safeExecute(ctx);
    }
}

export class EmptyLine extends CodeLine
{
    type = 'EmptyLine';

    public constructor(loc: Location)
    {
        super(undefined, new NullFunction(), loc);
    }
}

export class NullFunction extends AST.Executable
{
    type = 'NullFunction';

    public constructor()
    {
        super(NULL_LOCATION);
    }

    protected execute(ctx: Runtime)
    {

    }
}