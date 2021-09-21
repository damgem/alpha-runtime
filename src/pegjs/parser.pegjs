// ---- Program ----
PROGRAM
	= l:LINE* ll:LAST_LINE {return l === undefined ? [ll] : [...l, ll];}

// ---- Line ----
LINE = cl:CodeLine? Comment? "\r"?"\n" {return cl ?? }
LAST_LINE = cl:CodeLine? Comment? !. {return cl}

CodeLine
	= _ label:label? _ statement:LineStatement _ ";"? _
	{return new AST.CodeLine(label, statement, location());}

label
	= l:(RegularIdentifier / Number) _ ":" !(_ "=")
	{return l.value === undefined ? l.name : l.value;}

Comment
	= "//" [^\n\r]*

// ---- Statement ----
LineStatement
  = IfThen
  / Statement

IfThen
	= "if"i __ If:Comparison __ "then"i __ then:Statement
	{return new AST.Conditional(If, then, location());}

Statement
	= GotoStatement
  / CallStatement
  / ReturnStatement
  / StackPush
  / StackPop
  / StackCalculation
  / StackComparison
  / Definition

Definition
  = register:Register _ ":=" _ value:(Calculation / Value)
  {return new AST.Definition(register, value, location());}

GotoStatement
  = "goto" __ address:(Value / RegularIdentifier)
  {return new AST.Goto(address, location());}

CallStatement
  = "call" __ address:Value
  {return new AST.Call(address, location());}

ReturnStatement
  = "return"
  {return new AST.Return(location());}

StackPush
  // change to "push" (__ value:Value)? would give better error underlining
  = "push" __ value:Value?
  {return new AST.StackPush(value, location());}
  
StackPop
  // change to "pop" (__ value:Register)? would give better error underlining
  = "pop" valueContainer:(__ Register)?
  {return new AST.StackPop(valueContainer?.at(1), location());}

// ---- Operations ----
StackCalculation
	= "stack"i _ operator:CalculationOperatator
  {return new AST.Calculation(new AST.StackTop(), operator, new AST.StackTop(), location());}

StackComparison
	= "stack"i _ operator:ComparisonOperator
  {return new AST.Comparison(new AST.StackTop(), operator, new AST.StackTop(), location());}

Calculation
	= left:Value _ operator:CalculationOperatator _ right:Value
  {return new AST.Calculation(left, operator, right, location());}

Comparison
	= left:Value _ operator:ComparisonOperator _ right:Value
  {return new AST.Comparison(left, operator, right, location());}

CalculationOperatator = [+*\-\/%]
ComparisonOperator = "=" / [<>] "="?

// ---- VALUE ----
Value "value"
	= Number
  / Register

Register "register"
  = SpecialRegister
  / RegularRegister

RegularRegister "regular_register"
	= "ρ(" _ address:(RegularIdentifier / Value) _ ")"
  {return new AST.Register(address, location());}

SpecialRegister "special_register"
  = address:SpecialIdentifier
  {return new AST.Register(address, location());}

RegularIdentifier "regular_identifier"
  = [a-zA-Z]("_"* [a-zA-Z0-9]+)*
  {return new AST.Literal(text(), location());}

SpecialIdentifier "special_identifier"
	= [α-πσ-ω]("_"* [0-9]+)*
	{return new AST.Literal(text(), location());}
    
Number "number"
	= ("-" _)? ([0-9]+ "."? [0-9]* / "." [0-9]+)
	{return new AST.Literal(parseInt(text()), location());}

// ---- Formatting ----
_ "optional_whitespace"
  = [ \t]*
  
__ "whitespace"
  = [ \t]+