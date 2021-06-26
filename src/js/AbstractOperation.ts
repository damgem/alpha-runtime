import { Evalueateable } from "./AbstractTreeNodes";
import RuntimeEnv from "./SimpleRuntimeEnv";

export default abstract class Operation<OperatorType, ValueType> implements Evalueateable<ValueType> {
    protected operator: OperatorType;
    protected left: Evalueateable<ValueType>;
    protected right: Evalueateable<ValueType>;

    constructor(operator: OperatorType, left: Evalueateable<ValueType>, right: Evalueateable<ValueType>) {
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    abstract evaluate(re: RuntimeEnv): ValueType;
}