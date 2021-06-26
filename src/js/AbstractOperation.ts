import { Evalueateable } from "./AbstractTreeNodes";
import RuntimeEnv from "./RuntimeEnv";

export default abstract class Operation<O, V, R> implements Evalueateable<R> {
    protected operator: O;
    protected left: Evalueateable<V>;
    protected right: Evalueateable<V>;

    constructor(operator: O, left: Evalueateable<V>, right: Evalueateable<V>) {
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    abstract evaluate(re: RuntimeEnv): R;
}