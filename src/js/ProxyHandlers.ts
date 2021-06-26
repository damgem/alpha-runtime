// type OnListPushCallback<T> = (index: number, newValue: T) => void;
// type OnListPopCallback<T> = (index: number, oldValue: T) => void;

// type OnObjectInsertCallback<T> = (key: string, newValue: T) => void;
// type OnObjectDeleteCallback<T> = (key: string, oldValue: T) => void;

// const hasKey = <T extends object>(obj: T, k: keyof any): k is keyof T => k in obj;


// class Stack<T> {
//     private stack: T[] = [];
// }

// function createListProxyHandler<T> (onListPushCallback: OnListPushCallback<T>, onListPopCallback: OnListPopCallback<T>): ProxyHandler<T[]> {
//     return {
//         get(target: T[], p: string | symbol, receiver: any): any {
//             switch(p) {
//                 case "push":
//                     return (value: T) => {
//                         onListPushCallback(target.length, value);
//                         target.push(value);
//                     };

//                 case "pop":
//                     return () => {
//                         onListPopCallback(target.length-1, target[target.length-1]);
//                         return target.pop();
//                     };

//                 default:
//                     if(hasKey(target, p)) return target[p];
//                     throw new Error(`${String(p)} is not defined on ListProxyHandler.`);
//             }            
//         },
//         set(target: T[], p: string | symbol, value: any, receiver: any): boolean {
//             if(p === "length") {
//                 target.length = value;
//                 return true;
//             }

//             if(typeof(p) === "number") {
//                 target[p] = value;
//                 return true;
//             }

//             return false;
//         }
//     };
// };

// export const memoryProxyHandler: ProxyHandler<{[address: string] : number}> = {
//     deleteProperty(target: {[address: string] : number}, p: string | symbol): boolean {
//         if(typeof(p) === "symbol") p = String(p);
//         console.log("deleteProperty " + p);
//         if(!(p in target)) return false;
//         delete target[p];
//         DOM.rmRegister(p);
//         return true;
//     },
//     get(target: {[address: string] : number}, p: string | symbol, receiver: any): any {
//         if(typeof(p) === "symbol") p = String(p);
//         console.log(`get [${p}]`);
//         return target[p];
//     },
//     has(target: {[address: string] : number}, p: string | symbol): boolean {
//         if(typeof(p) === "symbol") p = String(p);
//         console.log(`has [${p}]`);
//         return p in target;
//     },
//     set(target: {[address: string] : number}, p: string | symbol, value: any, receiver: any): boolean {
//         if(typeof(p) === "symbol") p = String(p);
//         console.log(`set [${p}] = ${value}`);
//         target[p] = value;
//         DOM.setRegisterValue(p, value);
//         return true;
//     }
// };