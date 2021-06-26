// ---- Programm ----
Programm
  = lines:Line*

// ---- CodeLine ----
Line
  = cl:CodeLine ("\n" / !.)
  {return cl;}

CodeLine
  = _ label:Label? _ statement:Statement _ ";" _
  {return new PST.CodeLine(label?label:null, statement);}
  
Label
  = label:StringConstant _ ":" !(_ "=")
  {return label;}

// ---- Statement ----
Statement
  = ControlStatement
  / LinearStatement


// ---- Control Statements ----
ControlStatement
  = IfStatement

IfStatement
  = "if" __ condition:BooleanOperation __ "then" __ code:LinearStatement
  {return new PST.IfStatement(condition, code);}


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
  = register:Register _ ":=" _ value:NumericValue
  {return new PST.AssignStatement(register, value);}

GotoStatement
  = "goto" __ label:UncomputedValue
  {return new PST.GotoStatement(label);}

CallStatement
  = "call" __ label:UncomputedValue
  {return new PST.CallStatement(label);}

ReturnStatement
  = "return"
  {return new PST.ReturnStatement();}

PushStatement
  = "push" _? value:(NumericValue / Register)?
  {return new PST.PushStatement(value);}
  
PopStatement
  = "pop" _? value:(Register)?
  {return new PST.PopStatement(value);}

StackOperationStatement
  = "stack" _ op:NumericOperatator
  {return new PST.StackOperationStatement(op);}


// ---- (Inline) Operations ----
NumericOperation
  = left: UncomputedNumericValue _ op: NumericOperatator _ right: UncomputedNumericValue
  {return new PST.NumericOperation(op, left, right);}

BooleanOperation
  = left:UncomputedNumericValue _ op:BooleanOperator _ right: UncomputedNumericValue
  {return new PST.BooleanOperation(op, left, right);}

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
  {return new PST.MemoryRegister(address);}

Accumulator
  = "α" / "alpha" / "a"
  {return new PST.Accumulator();}


// ---- Values ----
Value
  = NumericValue
  / StringValue

UncomputedValue
  = UncomputedNumericValue
  / UncomputedStringValue

NumericValue
  = NumericOperation
  / UncomputedNumericValue

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
  {return new PST.Constant<number>(parseInt(digits.join(''), 10));}

StringConstant
  = text:[a-zA-Z0-9_]+
  {return new PST.Constant<string>(text.join(''));}

// ---- Formatting ----
_ "whitespace"
  = [ \s\t]*
  
__ "forced_whitespace"
  = [ \s\t]+