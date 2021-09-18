// build / update this dependecy with `npm run build:pegjs`
import { InternalError, SyntaxError, Location, NULL_LOCATION } from './Errors';
import {parse as pegParse, SyntaxError as pegSyntaxError} from './pegjs/parser';

export default function parse(program: string)
{
    try
    {
        const x = pegParse(program);
    }
    catch(error)
    {
        if(error instanceof pegSyntaxError)
        {
            throw new SyntaxError(error.location, error.message);

        }
        const loc = {
            start: {offset: 0, line: 0, column: 0},
            end:{offset: program.length, line: program.split('\n').length, column: program.split('\n').at(-1)?.length ?? 0}
        }
        
        throw new InternalError(loc, `[Internal Error] Parser failed: ${error}`)    

    }
}