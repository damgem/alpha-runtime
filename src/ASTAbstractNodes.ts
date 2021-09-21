import Runtime from "./Runtime";
import { AlphaError, RuntimeError, Location, NULL_LOCATION } from "./Errors";

abstract class Node
{
    public location: Location
    public abstract type: string;

    public constructor(loc: Location)
    {
        this.location = loc;
    }

    public safeCall<T>(fun: () => T)
    {
        try
        {
            return fun();
        }
        catch (error)
        {
            if(error instanceof AlphaError || this.location === NULL_LOCATION)
            {
                throw error;
            }
            const msg = error instanceof Error ? error.message : String(error);
            throw new RuntimeError(this.location, msg, `./ASTAbstractNodes.Node.safeCall() failed on ${fun.name}`);
        }
    }
}

export abstract class Supplier<T> extends Node
{
    protected abstract get(context: Runtime): T;

    public safeGet(context: Runtime) : T
    {
        return super.safeCall(() => this.get(context))
    }
}


export abstract class Register extends Supplier<number>
{
    protected abstract set(value: number, context: Runtime): void;

    public safeSet(value: number, context: Runtime): void {
        super.safeCall(() => this.set(value, context))
    }   
}

export abstract class Executable extends Node
{
    protected abstract execute(context: Runtime): void;

    public safeExecute(context: Runtime): void
    {
        super.safeCall(() => this.execute(context));
    }
}