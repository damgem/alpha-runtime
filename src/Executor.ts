import { CodeLine } from "./ASTNodes";
import Runtime from "./Runtime";

export default function execute(codeLines: CodeLine[], runtime: Runtime = new Runtime(codeLines, {}))
{
    while(runtime.codeManager.isRunning)
    {
        runtime.codeManager.getStatement().safeExecute(runtime);
        runtime.codeManager.advanceInstructionPointer();
    }

    return runtime.getSnapshot();
}