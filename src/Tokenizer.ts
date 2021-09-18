export class Pattern
{
    public pattern: RegExp;
    public type: TokenType;
    public msg?: string;

    public constructor(pattern: RegExp, type: TokenType)
    {   
        this.pattern = new RegExp(pattern, pattern.flags + 'y');
        this.type = type;
    }

    public static Error(pattern: RegExp, errorMessage: string)
    {
        const p = new Pattern(pattern, TokenType.ERROR);
        p.msg = errorMessage;
        return p;
    }

    public toString()
    {
        if(this.type === TokenType.ERROR)
        {
            return `[Error] ${this.msg}`;
        }
        return TokenType[this.type];
    }
}

export enum TokenType
{
    COMMENT,
    BRACKET_OPEN,
    BRACKET_CLOSE,
    COLON,
    SEMICOLON,
    CALCUATION_OPERATOR,
    COMPARISON_OPERATOR,
    LABEL,
    DEFINE,
    NUMBER,
    KEYWORD,
    IDENTIFIER,
    SPECIAL_IDENTIFIER,
    ERROR,
    SPACE,
    NEWLINE
}

const KEYWORDS = [
    'IF',
    'THEN',
    'GOTO',
    'CALL',
    'RETURN',
    'PUSH',
    'POP',
    'STACK',
    'ρ',
]

console.log(`${KEYWORDS.join("|")}`);

const patterns: Pattern[] = [
    new Pattern(/\/\/[^\n\Z]+/, TokenType.COMMENT),
    Pattern.Error(/\/[^\/\n][^\n]*/, 'Comments start with "//"'),

    new Pattern(/\(/, TokenType.BRACKET_OPEN),
    new Pattern(/\)/, TokenType.BRACKET_CLOSE),

    new Pattern(/:=/, TokenType.DEFINE),
    new Pattern(/:/, TokenType.COLON),
    new Pattern(/;/, TokenType.SEMICOLON),
    new Pattern(/[+\-*\/%]/, TokenType.CALCUATION_OPERATOR),
    new Pattern(/[><]=?/, TokenType.COMPARISON_OPERATOR),
    Pattern.Error(/=/, 'Single equal sign. Did you mean ":=", "<=" or ">=" ?'),

    new Pattern(/[0-9]+\.?[0-9]*|\.[0-9]+/, TokenType.NUMBER),
    Pattern.Error(/\./, 'Single dot. Did you mean to start a decimal like "1.5", "1." or ".5" ?'),

    new Pattern(new RegExp(`${KEYWORDS.join("|")}`), TokenType.KEYWORD),

    new Pattern(/(?<![_])[a-z0-9_]*[a-z0-9]+/, TokenType.IDENTIFIER),
    Pattern.Error(/(?<=[_])[a-z0-9_]*[a-z0-9]+/, 'Register name must not end with underscore'),
    new Pattern(/(?<![α-ωa-z0-9_])[α-ω]([0-9_]*[0-9]+)?/, TokenType.SPECIAL_IDENTIFIER),
    Pattern.Error(/(?<=[a-z])[α-ω]([0-9_]*[0-9]+)?/, 'Cannot mix greek and latin letters in Identifier name'),
    Pattern.Error(/(?<=[α-ω])[α-ω]([0-9_]*[0-9]+)?/, 'Special register name can only contain one greek letter'),
    Pattern.Error(/(?<=[_])[α-ω]([0-9_]*[0-9]+)?/, 'Special register name must not end with underscore'),
    Pattern.Error(/[0-9][a-z_][a-z0-9_]*/, 'Single dot. Did you mean to start a decimal like "1.5", "1." or ".5" ?'),
    
    new Pattern(/\r?\n/, TokenType.NEWLINE),
    new Pattern(/[ \s\t]/, TokenType.SPACE),
    Pattern.Error(/\w+|[^\w]+/, 'Unknown identifier'),
    Pattern.Error(/[.\n]/, 'Unknown')
]

export function tokenize(input: string)
{
    const tokens = [];

    while(input.length > 0)
    {
        let foundSomething = false;
        
        for(let pi in patterns)
        {
            const p = patterns[pi];
            const res = p.pattern.exec(input);
        
            if(res != null)
            {
                const match = res[0];
                if(p.type != TokenType.SPACE)
                {
                    tokens.push([p, match]);
                }
                input = input.slice(match.length);
                foundSomething = true;
                break;
            }
        }

        if(!foundSomething)
        {
            
            //throw new Error(`No pattern matches "${input}"`);
        }
    }

    return tokens;
}