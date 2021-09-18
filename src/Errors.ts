export interface Position
{
    offset: number
    line: number
    column: number
}

export interface Location
{
    start: Position
    end: Position
}

export const NULL_LOCATION: Location = {start:{offset: -1, line: -1, column: -1}, end:{offset: -1, line: -1, column: -1}};

export class AlphaError extends Error
{
    public name = "AlphaError";
    public location: Location;
    public errorMsg: string;
    public errorExplain?: string;

    public constructor(type: string, loc: Location, msg: string, explain?: string)
    {
        super(`[Alpha${type}Error] ${msg}` + (explain === undefined ? '' : `: ${explain}`) );
        this.location = loc;
        this.errorMsg = msg;
        this.errorExplain = explain;
    }
}

export class RuntimeError extends AlphaError
{
    public constructor(loc: Location, msg: string, explain?: string)
    {
        super("Runtime", loc, msg, explain);
    }
}

export class SyntaxError extends AlphaError
{
    public constructor(loc: Location, msg: string, explain?: string)
    {
        super("Syntax", loc, msg, explain);
    }
}

export class InternalError extends AlphaError
{
    public constructor(loc: Location, msg: string, explain?: string)
    {
        super("Internal", loc, msg, explain);
    }
}