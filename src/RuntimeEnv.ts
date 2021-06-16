export default abstract class RuntimeEnv {

    private static _stack: number[] = [];
    private static _accumulator: Number = 0;
    private static _instructionCounter: Number = 0;
    private static _memory: {[address: string] : number} = {};

    protected static labels: {[label: string] : number};

    protected static stack = new Proxy(RuntimeEnv._stack, {
        deleteProperty: function(target, property) {
            console.log("Deleted %s", property);
            return true;
        }
    });

    protected static accumulator = new Proxy(RuntimeEnv._accumulator, {
        deleteProperty: function(target, property) {
            console.log("Deleted %s", property);
            return true;
        }
    });

    protected static instructionCounter = new Proxy(RuntimeEnv._instructionCounter, {
        deleteProperty: function(target, property) {
            console.log("Deleted %s", property);
            return true;
        }
    });

    protected static memory = new Proxy(RuntimeEnv._memory, {
        deleteProperty: function(target, property) {
            console.log("Deleted %s", property);
            return true;
        }
    });

    protected static throwError(msg: string) {
        console.warn(msg);
    }
};