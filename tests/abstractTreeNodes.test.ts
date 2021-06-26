import { describe, it } from '@jest/globals';
import * as PST from '../src/js/ParserTreeNodes';
import * as AST from '../src/js/AbstractTreeNodes';

import RuntimeEnv from './../src/js/RuntimeEnv';

let re: RuntimeEnv;
beforeEach(() => re = new RuntimeEnv({}));

describe("ParserTreeNodes LowLevelFunctions", () => {

    describe("Constants", () => {
        it("Numeric", () => expect(new PST.Constant(34).evaluate()).toBe(34));
        it("String", () => expect(new PST.Constant("abcdef").evaluate()).toBe("abcdef"));
    });

    describe("Read/Write", () => {

        describe("Accumulator", () => {
            let acc: PST.Accumulator;
            beforeEach(() => acc = new PST.Accumulator());

            it("Inital Value", () => expect(acc.evaluate(re)).toBe(0));

            it("Evaluate", () => {
                re.accumulator = 213;
                expect(acc.evaluate(re)).toBe(213);
            });

            it("Set", () => {
                acc.set(166, re);
                expect(re.accumulator).toBe(166);
            });
        });

        describe("Memory", () => {
            let mem: PST.Accumulator;
            let addr = "ghijkl"
            beforeEach(() => mem = new PST.MemoryRegister(new PST.Constant(addr)));

            // TODO: specific Error
            it("Inital Value", () => expect(()=>mem.evaluate(re)).toThrow());

            it("Evaluate", () => {
                re.memory.set(addr, 120);
                expect(mem.evaluate(re)).toBe(120);
            });

            it("Set", () => {
                mem.set(189, re);
                expect(re.memory.get(addr)).toBe(189);
            });
        });

        describe("Stack", () => {
            it("Push", () => {
                new PST.PushStatement(new PST.Constant(932)).execute(re);
                expect(re.stack.top).toBe(932);
                expect(re.stack.size).toBe(1);
            });
            it("Pop", () => {
                re.stack.push(345);
                new PST.PopStatement(new PST.Accumulator).execute(re);
                expect(re.accumulator).toBe(345);
                expect(re.stack.isEmpty).toBe(true);
            });
            // TODO: specific Error
            it("Pop from empty stack", () => {
                let stmt = new PST.PopStatement(new PST.Accumulator);
                expect(() => stmt.execute(re)).toThrow();
            });
        });

        describe("StackTop", () => {
            it("Push", () => {
                new PST.StackTop().set(266, re);
                expect(re.stack.top).toBe(266);
                expect(re.stack.size).toBe(1);
            });
            it("Pop", () => {
                re.stack.push(230);
                expect(new PST.StackTop().evaluate(re)).toBe(230);
                expect(re.stack.isEmpty).toBe(true);
            });
            // TODO: specific Error
            it("Pop from empty stack", () => {
                let stmt = new PST.StackTop();
                expect(() => stmt.evaluate(re)).toThrow();
            });
        })
    });
    
    describe("Calculations", () => {
        
        describe("NumericOperations", () => {

            describe("With Constants", () => {
                let calc = (n1: number, op, n2: number) => new PST.NumericOperation(op, new PST.Constant(n1), new PST.Constant(n2)).evaluate(re);
                it("Addition",       () => expect(calc(278, "+", 499)).toBe(777));
                it("Subtraction",    () => expect(calc(278, "-", 499)).toBe(-221));
                it("Multiplication", () => expect(calc(27.8, "*", 49.9)).toBe(1387.22));
                it("Division",       () => expect(calc(100, "/", 40)).toBeCloseTo(2.5));
                it("Modulus",        () => expect(calc(18, "%", 5)).toBe(3));
            });

            describe("On Stack", () => {
                let calc = (op) => {new PST.NumericStackOperationStatement(op).execute(re); return re.stack.top;}
                beforeEach(() => {
                    re.stack.push(4);
                    re.stack.push(10);
                });
                it("Addition", () => expect(calc("+")).toBe(14));
                it("Subtraction", () => expect(calc("-")).toBe(6));
                it("Multiplication", () => expect(calc("*")).toBe(40));
                it("Division", () => expect(calc("/")).toBeCloseTo(2.5));
                it("Modulus", () => expect(calc("%")).toBe(2));
                it("Number of elements on stack", () => {
                    expect(re.stack.size).toBe(2);
                    calc("+");
                    expect(re.stack.size).toBe(1);
                });
            });
        });
            
        describe("BooleanOperations", () => {

            describe("With Constants", () => {
                let calc = (n1: number, op, n2: number) => new PST.BooleanOperation(op, new PST.Constant(n1), new PST.Constant(n2)).evaluate(re);

                it("Equal",                     () => expect(calc(0, "=", 0)).toBe(true));

                it("Greater (Positive)",        () => expect(calc(1, ">", 0)).toBe(true));
                it("Greater (Exact)",           () => expect(calc(0, ">", 0)).toBe(false));
                it("Greater (Negative)",        () => expect(calc(0, ">", 1)).toBe(false));

                it("Greater Equal (Positive)",  () => expect(calc(1, ">=", 0)).toBe(true));
                it("Greater Equal (Exact)",     () => expect(calc(0, ">=", 0)).toBe(true));
                it("Greater Equal (Negative)",  () => expect(calc(0, ">=", 1)).toBe(false));

                it("Less (Positive)",           () => expect(calc(1, "<", 0)).toBe(false));
                it("Less (Exact)",              () => expect(calc(0, "<", 0)).toBe(false));
                it("Less (Negative)",           () => expect(calc(0, "<", 1)).toBe(true));

                it("Less Equal (Positive)",     () => expect(calc(1, "<=", 0)).toBe(false));
                it("Less Equal (Exact)",        () => expect(calc(0, "<=", 0)).toBe(true));
                it("Less Equal (Negative)",     () => expect(calc(0, "<=", 1)).toBe(true));
            });

            describe("On Stack", () => {
                let calc  = (n1: number, op, n2: number) => {
                    re.stack.push(n2);
                    re.stack.push(n1);
                    return new PST.BooleanStackOperationStatement(op).evaluate(re);
                }
                
                it("Equal",                     () => expect(calc(0, "=", 0)).toBe(true));

                it("Greater (Positive)",        () => expect(calc(1, ">", 0)).toBe(true));
                it("Greater (Exact)",           () => expect(calc(0, ">", 0)).toBe(false));
                it("Greater (Negative)",        () => expect(calc(0, ">", 1)).toBe(false));

                it("Greater Equal (Positive)",  () => expect(calc(1, ">=", 0)).toBe(true));
                it("Greater Equal (Exact)",     () => expect(calc(0, ">=", 0)).toBe(true));
                it("Greater Equal (Negative)",  () => expect(calc(0, ">=", 1)).toBe(false));

                it("Less (Positive)",           () => expect(calc(1, "<", 0)).toBe(false));
                it("Less (Exact)",              () => expect(calc(0, "<", 0)).toBe(false));
                it("Less (Negative)",           () => expect(calc(0, "<", 1)).toBe(true));

                it("Less Equal (Positive)",     () => expect(calc(1, "<=", 0)).toBe(false));
                it("Less Equal (Exact)",        () => expect(calc(0, "<=", 0)).toBe(true));
                it("Less Equal (Negative)",     () => expect(calc(0, "<=", 1)).toBe(true));
            });
        });
    });
});

describe("ParserTreeNodes Advanced Statements", () => {

    describe("Goto Statement", () => {
        it("string address", () => {
            re.labels["frankfurt"] = 239;
            new PST.GotoStatement(new PST.Constant("frankfurt")).execute(re);
            expect(re.instructionCounter).toBe(239);
        });

        it("numeric address", () => {
            new PST.GotoStatement(new PST.Constant(1928)).execute(re);
            expect(re.instructionCounter).toBe(1928);
        });

        it("digit string address", () => {
            re.labels["8392"] = 3829;
            new PST.GotoStatement(new PST.Constant("8392")).execute(re);
            expect(re.instructionCounter).toBe(3829);
        });
    });

    it("Assign Statement", () => {
        let reg: AST.Register = {evaluate: jest.fn(), set: jest.fn()};
        new PST.AssignStatement(reg, new PST.Constant(1298)).execute(re);
        expect(reg.evaluate).not.toBeCalled();
        expect(reg.set).toBeCalledWith(1298, re);
    })

    describe("If Statement", () => {
        let code: AST.Executable;
        beforeEach(() => code = {execute: jest.fn()});

        it("True Conditional", () => {
            new PST.IfStatement(new PST.Constant(true), code).execute(re);
            expect(code.execute).toBeCalledTimes(1);
        });
        
        it("False Conditional", () => {
            new PST.IfStatement(new PST.Constant(false), code).execute(re);
            expect(code.execute).toBeCalledTimes(0);
        });
    });

    describe("Return Statement", () => {
        it("Empty Stack", () => {
            expect(re.isRunning).toBe(true);
            re.stack.push(359);
            new PST.ReturnStatement().execute(re);
            expect(re.instructionCounter).toBe(359);
            expect(re.isRunning).toBe(true);
        });
        it("Non empty stack", () => {
            expect(re.isRunning).toBe(true);
            new PST.ReturnStatement().execute(re);
            expect(re.isRunning).toBe(false);
        })
    });

    describe("Call Statement", () => {
        it("String Address", () => {
            re.labels["bonn"] = 12938;
            new PST.CallStatement(new PST.Constant("bonn")).execute(re);
            expect(re.instructionCounter).toBe(12938);
        });
        it("Numeric Address", () => {
            new PST.CallStatement(new PST.Constant(2192)).execute(re);
            expect(re.instructionCounter).toBe(2192);
        });
        it("Digit String Address", () => {
            re.labels["23982"] = 9028;
            new PST.CallStatement(new PST.Constant("23982")).execute(re);
            expect(re.instructionCounter).toBe(9028);
        });
    })

    describe("CodeLine", () => {
        it("Label", () => {
            expect(new PST.CodeLine("berlin", {execute: null}).label).toBe("berlin");
            expect(new PST.CodeLine(null, {execute: null}).label).toBeUndefined();
        });
        it("Execute", () => {
            let stmt: AST.Executable = {execute: jest.fn()}
            new PST.CodeLine(null, stmt).execute(re);
            expect(stmt.execute).toBeCalledTimes(1);
        });
    })


});