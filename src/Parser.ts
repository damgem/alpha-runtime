// build / update this dependecy with `npm run build:pegjs`
import { CodeLine } from './ASTNodes';
import { AlphaError, InternalError, SyntaxError} from './Errors';
import {parse as pegParse, SyntaxError as pegSyntaxError} from './pegjs/parser';

export default function parse(program: string): CodeLine[]
{
    try
    {
        const parsed = pegParse(program);

        if(!Array.isArray(parsed))
        {
            throw new InternalError(
                {
                    start: {offset: 0, line: 0, column: 0},
                    end: {
                        offset: program.length,
                        line: program.split('\n').length,
                        column: program.split('\n').at(-1)?.length ?? 0
                    }
                },
                "Parser failed to return an array",
                `type=${typeof parsed}; parsed=${parsed}`
            );
        }

        for(let i = 0; i < parsed.length; i++)
        {
            if(!(parsed[i] instanceof CodeLine))
            {
                const ofs = program.split('\n').splice(0, i).join('\n').length;
                const len = program.split('\n')[i].length;
                throw new InternalError(
                    {
                        start: {offset: ofs, line: i, column: 0},
                        end: {offset: ofs+len, line: i, column: len}
                    },
                    'Parser failed to parse this line into a `CodeLine`',
                    `type=${typeof parsed[i]}; parsed=${JSON.stringify(parsed[i])}`
                );
            }
        }

        return parsed;
    }
    catch(error)
    {
        if(error instanceof AlphaError)
        {
            throw error;
        }
        if(error instanceof pegSyntaxError)
        {
            throw new SyntaxError(error.location, error.message);
        }
        const loc = {
            start: {offset: 0, line: 0, column: 0},
            end: {
                offset: program.length,
                line: program.split('\n').length,
                column: program.split('\n').at(-1)?.length ?? 0
            }
        };
        
        throw new InternalError(loc, `[Internal Error] Parser failed: ${error}`);
    }
}