/* eslint-disable @typescript-eslint/no-unused-vars */
// utils/lexer.ts
import type { Token, LanguageStyle } from "../types";

export function tokenize(code: string, lang: LanguageStyle): Token[] {
  const tokens: Token[] = [];
  const lines = code.split("\n");

  lines.forEach((line, lineIndex) => {
    const words = line.match(
      /#include|[a-zA-Z_]\w*|<=|>=|==|!=|[{}();,<>.+\-*/]/g,
    );

    if (!words) return;

    words.forEach((value) => {
      tokens.push({
        line: lineIndex + 1,
        value,
        type: classifyToken(value, lang),
      });
    });
  });

  return tokens;
}

function classifyToken(value: string, lang: LanguageStyle): Token["type"] {
  if (value === "#include") return "preprocessor";
  if (/^\d+$/.test(value)) return "number";
  if (["if", "return", "for", "while"].includes(value)) return "keyword";
  if (value === ";") return "semicolon";
  if (/[{}()]/.test(value)) return "delimiter";
  return "identifier";
}
