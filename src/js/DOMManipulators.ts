export function alertError(msg: string): never {
    window.alert(msg);
    throw new Error(msg);
}

export function safeQuerySelector<ElementType extends HTMLElement>(query: string): ElementType {
    const element = document.querySelector(query);
    if(element === null) alertError(`Critical Error: cannot find ${query} element!`);
    return element as ElementType;
}

const register = safeQuerySelector('#register-body');
const stack = safeQuerySelector('#stack-body');

export function addStackEntry(value: number) {
    let li = document.createElement("li");
    li.innerText = String(value);
    stack.appendChild(li);
}

export function rmStackEntry() {
    stack.lastChild!.remove();
}