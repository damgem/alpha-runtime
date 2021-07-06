import { describe, it } from '@jest/globals';
import * as PST from '../src/js/ParserTreeNodes';
import * as AST from '../src/js/AbstractTreeNodes';

import RuntimeCore from '../src/js/RuntimeCore';

let rc: RuntimeCore;
beforeEach(() => rc = new RuntimeCore({}));

describe("ParserTreeNodes LowLevelFunctions", () => {

    describe("Constants", () => {
        it("Numeric", () => expect(new PST.Constant(34).evaluate()).toBe(34));
        it("String", () => expect(new PST.Constant("abcdef").evaluate()).toBe("abcdef"));
    });

    describe("Read/Write", () => {

        describe("Accumulator", () => {
            let acc: PST.Accumulator;
            beforeEach(() => acc = new PST.Accumulator());

            it("Inital Value", () => expect(acc.evaluate(rc)).toBe(0));

            it("Evaluate", () => {
                rc.accumulator = 213;
                expect(acc.evaluate(rc)).toBe(213);
            });

            it("Set", () => {
                acc.set(166, rc);
                expect(rc.accumulator).toBe(166);
            });
        });

        describe("Memory", () => {
            let mem: PST.Accumulator;
            let addr = "ghijkl"
            beforeEach(() => mem = new PST.MemoryRegister(new PST.Constant(addr)));

            // TODO: specific Error
            it("Inital Value", () => expect(()=>mem.evaluate(rc)).toThrow());

            it("Evaluate", () => {
                rc.memory.set(addr, 120);
                expect(mem.evaluate(rc)).toBe(120);
            });

            it("Set", () => {
                mem.set(189, rc);
                expect(rc.memory.get(addr)).toBe(189);
            });
        });

        describe("Stack", () => {
            it("Push", () => {
                new PST.PushStatement(new PST.Constant(932)).execute(rc);
                expect(rc.stack.top).toBe(932);
                expect(rc.stack.size).toBe(1);
            });
            it("Pop", () => {
                rc.stack.push(345);
                new PST.PopStatement(new PST.Accumulator).execute(rc);
                expect(rc.accumulator).toBe(345);
                expect(rc.stack.isEmpty).toBe(true);
            });
            // TODO: specific Error
            it("Pop from empty stack", () => {
                let stmt = new PST.PopStatement(new PST.Accumulator);
                expect(() => stmt.execute(rc)).toThrow();
            });
        });

        describe("StackTop", () => {
            it("Push", () => {
                new PST.StackTop().set(266, rc);
                expect(rc.stack.top).toBe(266);
                expect(rc.stack.size).toBe(1);
            });
            it("Pop", () => {
                rc.stack.push(230);
                expect(new PST.StackTop().evaluate(rc)).toBe(230);
                expect(rc.stack.isEmpty).toBe(true);
            });
            // TODO: specific Error
            it("Pop from empty stack", () => {
                let stmt = new PST.StackTop();
                expect(() => stmt.evaluate(rc)).toThrow();
            });
        })
    });
    
    describe("Calculations", () => {
        
        describe("NumericOperations", () => {

            describe("With Constants", () => {
                let calc = (n1: number, op, n2: number) => new PST.NumericOperation(op, new PST.Constant(n1), new PST.Constant(n2)).evaluate(rc);
                it("Addition",       () => expect(calc(278, "+", 499)).toBe(777));
                it("Subtraction",    () => expect(calc(278, "-", 499)).toBe(-221));
                it("Multiplication", () => expect(calc(27.8, "*", 49.9)).toBe(1387.22));
                it("Division",       () => expect(calc(100, "/", 40)).toBeCloseTo(2.5));
                it("Modulus",        () => expect(calc(18, "%", 5)).toBe(3));
            });

            describe("On Stack", () => {
                let calc = (op) => {new PST.NumericStackOperationStatement(op).execute(rc); return rc.stack.top;}
                beforeEach(() => {
                    rc.stack.push(4);
                    rc.stack.push(10);
                });
                it("Addition", () => expect(calc("+")).toBe(14));
                it("Subtraction", () => expect(calc("-")).toBe(6));
                it("Multiplication", () => expect(calc("*")).toBe(40));
                it("Division", () => expect(calc("/")).toBeCloseTo(2.5));
                it("Modulus", () => expect(calc("%")).toBe(2));
                it("Number of elements on stack", () => {
                    expect(rc.stack.size).toBe(2);
                    calc("+");
                    expect(rc.stack.size).toBe(1);
                });
            });
        });
            
        describe("BooleanOperations", () => {

            describe("With Constants", () => {
                let calc = (n1: number, op, n2: number) => new PST.BooleanOperation(op, new PST.Constant(n1), new PST.Constant(n2)).evaluate(rc);

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
                    rc.stack.push(n2);
                    rc.stack.push(n1);
                    return new PST.BooleanStackOperationStatement(op).evaluate(rc);
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
            rc.labels["frankfurt"] = 239;
            new PST.GotoStatement(new PST.Constant("frankfurt")).execute(rc);
            expect(rc.instructionCounterNext).toBe(239);
        });

        it("numeric address", () => {
            new PST.GotoStatement(new PST.Constant(1928)).execute(rc);
            expect(rc.instructionCounterNext).toBe(1928);
        });

        it("digit string address", () => {
            rc.labels["8392"] = 3829;
            new PST.GotoStatement(new PST.Constant("8392")).execute(rc);
            expect(rc.instructionCounterNext).toBe(3829);
        });
    });

    it("Assign Statement", () => {
        let reg: AST.Register = {evaluate: jest.fn(), set: jest.fn()};
        new PST.AssignStatement(reg, new PST.Constant(1298)).execute(rc);
        expect(reg.evaluate).not.toBeCalled();
        expect(reg.set).toBeCalledWith(1298, rc);
    })

    describe("If Statement", () => {
        let code: AST.Executable;
        beforeEach(() => code = {execute: jest.fn()});

        it("True Conditional", () => {
            new PST.IfStatement(new PST.Constant(true), code).execute(rc);
            expect(code.execute).toBeCalledTimes(1);
        });
        
        it("False Conditional", () => {
            new PST.IfStatement(new PST.Constant(false), code).execute(rc);
            expect(code.execute).toBeCalledTimes(0);
        });
    });

    describe("Return Statement", () => {
        it("Empty Stack", () => {
            expect(rc.isRunning).toBe(true);
            rc.stack.push(359);
            new PST.ReturnStatement().execute(rc);
            expect(rc.instructionCounterNext).toBe(359);
            expect(rc.isRunning).toBe(true);
        });
        it("Non empty stack", () => {
            expect(rc.isRunning).toBe(true);
            new PST.ReturnStatement().execute(rc);
            expect(rc.isRunning).toBe(false);
        })
    });

    describe("Call Statement", () => {
        it("String Address", () => {
            rc.labels["bonn"] = 12938;
            new PST.CallStatement(new PST.Constant("bonn")).execute(rc);
            expect(rc.instructionCounterNext).toBe(12938);
        });
        it("Numeric Address", () => {
            new PST.CallStatement(new PST.Constant(2192)).execute(rc);
            rc.finishStatementExecution();
            expect(rc.instructionCounter).toBe(2192);
        });
        it("Digit String Address", () => {
            rc.labels["23982"] = 9028;
            new PST.CallStatement(new PST.Constant("23982")).execute(rc);
            rc.finishStatementExecution();
            expect(rc.instructionCounter).toBe(9028);
        });
    })

    describe("CodeLine", () => {
        it("Label", () => {
            expect(new PST.CodeLine({execute: null}, "berlin").label).toBe("berlin");
            expect(new PST.CodeLine({execute: null}).label).toBeUndefined();
        });
        it("Execute", () => {
            let stmt: AST.Executable = {execute: jest.fn()}
            new PST.CodeLine(stmt).execute(rc);
            expect(stmt.execute).toBeCalledTimes(1);
        });
    })


});