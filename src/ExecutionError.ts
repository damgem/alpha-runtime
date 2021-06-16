class ExecutionError extends Error {
    name = "ExecutionError";
    constructor(msg: string) {
        super(msg);
    }
}

class ExecutionEnd extends Error {}