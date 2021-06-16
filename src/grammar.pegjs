// ---- Programm ----
Programm
  = lines:CodeLine*
  {return lines;}


// ---- CodeLine ----
CodeLine
  = (label:StringConstant ":")? statement:Statement ";"
  {return new CodeLine(label, statement); }


// ---- Statement ----
Statement
  = ControlStatement
  / LinearStatement


// ---- Control Statements ----
ControlStatement
  = IfStatement

IfStatement
  = "if" __ condition:BooleanOperation __ "then" __ code:LinearStatement
  {return new IfStatement(condition, code);}


// ---- Linear Statements ----
LinearStatement
  = AssignStatement
  / GotoStatement
  / ReturnStatement
  / CallStatement
  / PushStatement
  / PopStatement
  / StackOperationStatement

AssignStatement
  = register:Register ":=" value:NumericValue
  {return new AssignStatement(register, value);}

GotoStatement
  = "goto" __ label:UncomputedValue
  {return new GotoStatement(label);}

CallStatement
  = "call" __ label:UncomputedValue
  {return new CallStatement(label);}

ReturnStatement
  = "return"
  {return new ReturnStatement();}

PushStatement
  = "push"
  {return new PushStatement();}

PopStatement
  = "pop"
  {return new PopStatement();}

StackOperationStatement
  = "stack" _ op:NumericOperatator
  {return StackOperationStatement(op);}


// ---- (Inline) Operations ----
NumericOperation
  = left: UncomputedNumericValue _ op: NumericOperatator _ right: UncomputedNumericValue
  {return new NumericOperation(op, left, right);}

BooleanOperation
  = left:UncomputedNumericValue _ op:BooleanOperator _ right: UncomputedNumericValue
  {return new BooleanOperation(op, left, right);}

NumericOperatator
  = "+" / "-" / "*" / "/" / "%";

BooleanOperator
  = "=" / ">=" / "<=" / ">" / "<"


// ---- Register ----
Register
  = Accumulator
  / MemoryRegister

MemoryRegister
  = ("ρ" / "rho" / "p") _ "(" _ address:(UncomputedValue) _ ")"
  {return new MemoryCell(address);}

Accumulator
  = "α" / "alpha" / "a"
  {return new Accumulator();}


// ---- Values ----
Value
  = NumericValue
  / StringValue

UncomputedValue
  = UncomputedNumericValue
  / UncomputedStringValue

NumericValue
  = UncomputedNumericValue
  / NumericOperation

UncomputedNumericValue
  = Register
  / NumericConstant

StringValue
  = UncomputedStringValue

UncomputedStringValue
  = StringConstant


// ---- Constants ----
NumericConstant
  = digits:[0-9]+
  {return new Constant<number>(parseInt(digits.join(''), 10));}

StringConstant
  = text:[a-zA-Z0-9_]+
  {return new Constant<string>(text.join(''));}

// ---- Formatting ----
_ "whitespace"
  = [ \t\n\r]*
  
__ "forced_whitespace"
  = [ \t\n\r]+