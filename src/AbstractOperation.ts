import * as AST from "./AST";

export default abstract class Operation<OperatorType, ValueType> implements AST.Evalueateable<ValueType> {
    protected operator: OperatorType;
    protected left: AST.Evalueateable<ValueType>;
    protected right: AST.Evalueateable<ValueType>;

    constructor(operator: OperatorType, left: AST.Evalueateable<ValueType>, right: AST.Evalueateable<ValueType>) {
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    toString() {
        
    }

    abstract evaluate(): ValueType;
}