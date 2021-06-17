
import * as DOM from "./DOMManipulators";

let stackProxyHandler: ProxyHandler<number[]> = {
    apply(target: number[], thisArg: any, argArray: any[]): any {
      console.log("apply")
    },
    construct(target: number[], argArray: any[], newTarget: Function): any {
      console.log("apply");
      return 0;
    },
    defineProperty(target: number[], p: string | symbol, attributes: PropertyDescriptor): boolean {
      console.log("defineProperty");
      return true;
    },
    deleteProperty(target: number[], p: string | symbol): boolean {
      console.log("deleteProperty");
      return true;
    },
    get(target: number[], p: string | symbol, receiver: any): any {
      console.log(`get [${String(p)}]`);

      if(p === "push") return (value: number) => {
        target.push(value);
        DOM.addStackEntry(value);
      };

      if(p === "pop") return () => {
        target.pop();
        DOM.rmStackEntry();
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

let memoryProxyHandler: ProxyHandler<{[address: string] : number}> = {
    deleteProperty(target: {[address: string] : number}, p: string | symbol): boolean {
      console.log("deleteProperty " + String(p));
      if(!(String(p) in target)) return false;
      delete target[String(p)];
      return true;
    },
    get(target: {[address: string] : number}, p: string | symbol, receiver: any): any {
      console.log(`get [${String(p)}]`);
      return target[String(p)];
    },
    has(target: {[address: string] : number}, p: string | symbol): boolean {
      console.log(`has [${String(p)}]`);
      return p in target;
    },
    set(target: {[address: string] : number}, p: string | symbol, value: any, receiver: any): boolean {
      console.log(`set [${String(p)}] = ${value}`);
      target[String(p)] = value;
      return true;
    }
};

export {stackProxyHandler, memoryProxyHandler};