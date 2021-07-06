import Runtime, {Evalueateable} from "./Abstract";

export default abstract class Operation<A, OperatorType, InputValueType, OutputValueType, L> implements Evalueateable<A> {
    protected operator: O;
    protected left: Evalueateable<V>;
    protected right: Evalueateable<V>;

    constructor(operator: O, left: Evalueateable<V>, right: Evalueateable<V>) {
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    abstract evaluate(re: RuntimeCore): R;
}