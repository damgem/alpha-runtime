export class ExecutionError extends Error {
    name = "ExecutionError";
    constructor(msg: string) {
        super(msg);
    }
}

export class ExecutionEnd extends Error {}

export class SyntaxError extends Error {}