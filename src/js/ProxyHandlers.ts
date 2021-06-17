
import * as DOM from "./DOMManipulators";

export const stackProxyHandler: ProxyHandler<number[]> = {
    get(target: number[], p: string | symbol, receiver: any): any {
        console.log(`get [${String(p)}]`);

        if(p === "push") return (value: number) => {
            DOM.addStackEntry(value);
            target.push(value);
        };

        if(p === "pop") return () => {
            DOM.rmStackEntry();
            return target.pop();
        };

        if(p === "length") return target.length;

        if(typeof(p) === "number") {
            return target[p];
        }

        console.log("undefined property " + String(p));
        return undefined;
    },
    has(target: number[], p: string | symbol): boolean {
        console.log("has");
        return true;
    },
    set(target: number[], p: string | symbol, value: any, receiver: any): boolean {
        console.log(`set [${String(p)}] = ${value}`);
        if(p == "length") {
            target.length = value;
            return true;
        }
        if(typeof(p) === "number") {
            target[p] = value;
            return true;
        }        
        return false;
    }
};

export const memoryProxyHandler: ProxyHandler<{[address: string] : number}> = {
    deleteProperty(target: {[address: string] : number}, p: string | symbol): boolean {
        if(typeof(p) === "symbol") p = String(p);
        console.log("deleteProperty " + p);
        if(!(p in target)) return false;
        delete target[p];
        DOM.rmRegister(p);
        return true;
    },
    get(target: {[address: string] : number}, p: string | symbol, receiver: any): any {
        if(typeof(p) === "symbol") p = String(p);
        console.log(`get [${p}]`);
        return target[p];
    },
    has(target: {[address: string] : number}, p: string | symbol): boolean {
        if(typeof(p) === "symbol") p = String(p);
        console.log(`has [${p}]`);
        return p in target;
    },
    set(target: {[address: string] : number}, p: string | symbol, value: any, receiver: any): boolean {
        if(typeof(p) === "symbol") p = String(p);
        console.log(`set [${p}] = ${value}`);
        target[p] = value;
        DOM.setRegisterValue(p, value);
        return true;
    }
};