export function alertError(msg: string): never {
    window.alert(msg);
    throw new Error(msg);
}

export function safeQuerySelector<ElementType extends HTMLElement>(query: string): ElementType {
    const element = document.querySelector(query);
    if(element === null) alertError(`Critical Error: cannot find ${query} element!`);
    return element as ElementType;
}

const registers = safeQuerySelector('#register-body');
const stack = safeQuerySelector('#stack-body');

export function addStackEntry(value: number) {
    let li = document.createElement("li");
    li.innerText = String(value);
    stack.appendChild(li);
}

export function rmStackEntry() {
    stack.lastChild!.remove();
}

export function setRegisterValue(address: string, value: number) {
    let reg = document.getElementById("#register-memory-" + address);
    if(reg === null) {
        reg = document.createElement("li");
        reg.id = "#register-memory-" + address;
        registers.appendChild(reg);
    }

    reg.innerText = `ρ(${address}) := ${value}`;
}

export function rmRegister(address: string) {
    document.getElementById("#register-memory-" + address)!.remove();
}