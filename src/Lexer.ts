import { Token } from "codemirror";

export enum TokenType {
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
    SPACE
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

class Pattern {
    public pattern: RegExp;
    public type: TokenType;
    public msg?: string;

    public constructor(pattern: RegExp, type: TokenType) {
        this.pattern = pattern;
        this.type = type;
    }

    public static Error(pattern: RegExp, errorMessage: string) {
        const p = new Pattern(pattern, TokenType.ERROR);
        p.msg = errorMessage;
        return p;
    }

    public toString() {
        if(this.type === TokenType.ERROR) {
            return `[Error] ${this.msg}`;
        }
        return TokenType[this.type];
    }
}

let patterns: Pattern[] = [
    new Pattern(/\/\/[^\n\Z]+/, TokenType.COMMENT),
    Pattern.Error(/\/[^\/\n][^\n]*/, 'Comments start with "//"'),

    new Pattern(/\(/, TokenType.BRACKET_OPEN),
    new Pattern(/\)/, TokenType.BRACKET_CLOSE),
    new Pattern(/:/, TokenType.COLON),
    new Pattern(/;/, TokenType.SEMICOLON),

    new Pattern(/:=/, TokenType.DEFINE),
    new Pattern(/[+\-*\/]/, TokenType.CALCUATION_OPERATOR),
    new Pattern(/[><]=?/, TokenType.COMPARISON_OPERATOR),
    Pattern.Error(/=/, 'Single equal sign. Did you mean ":=", "<=" or ">=" ?'),

    new Pattern(/[0-9]+\.?[0-9]*|\.[0-9]+/, TokenType.NUMBER),
    Pattern.Error(/\./, 'Single dot. Did you mean to start a decimal like "1.5", "1." or ".5" ?'),

    new Pattern(new RegExp(`(${KEYWORDS.join("|")})`), TokenType.KEYWORD),
    new Pattern(/[a-z0-9_]+/, TokenType.IDENTIFIER),
    new Pattern(/[α-ω]([0-9_]*[0-9]+)?\b/, TokenType.SPECIAL_IDENTIFIER),
    new Pattern(/[α-ω]([0-9_]*[0-9]+)?(?<![α-ωa-z0-9_])/, TokenType.SPECIAL_IDENTIFIER),
    Pattern.Error(/[α-ω]([0-9_]*[0-9]+)?(?<=[α-ωa-z0-9_])/, 'Expected space or other non  '),
    Pattern.Error(/[0-9][a-z_][a-z0-9_]*/, 'Single dot. Did you mean to start a decimal like "1.5", "1." or ".5" ?'),
    
    new Pattern(/[ \n\t]/, TokenType.SPACE),
    Pattern.Error(/\w+|[^\w]+/, 'Unknown identifier'),
    Pattern.Error(/./, 'Unknown')
]

export function tokenize(input: string) {

    const tokens = [];

    while(input.length > 0) {

        let foundSomething = false;
        for(let pi in patterns) {
            const p = patterns[pi];
            const res = new RegExp(p.pattern, 'y').exec(input);
            if(res != null) {
                const match = res[0];
                tokens.push([p.toString(), match]);
                input = input.slice(match.length);
                foundSomething = true;
                break;
            }
        }
        if(!foundSomething) {
            throw new Error("No pattern matched!");
        }
    }

    return tokens;
}