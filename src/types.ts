export type TokenType =
  | "preprocessor"
  | "header"
  | "keyword"
  | "datatype"
  | "function"
  | "identifier"
  | "operator"
  | "relational_operator"
  | "assignment_operator"
  | "input_operator"
  | "output_operator"
  | "delimiter"
  | "comma"
  | "dot"
  | "semicolon"
  | "literal"
  | "digit"
  | "boolean"
  | "quote"
  | "stream_manipulator"
  | "output_statement"
  | "input_statement"
  | "number";

export interface Token {
  line: number;
  type: TokenType;
  value: string;
}

export interface AnalyzerResult {
  tokens: Token[];
  lexErrors: string[];
  synErrors: string[];
}

export type LanguageStyle = "CPP" | "PYTHON" | "JS";

/**
 * Per-language rule engine hook (IMPORTANT FIX)
 */
export type Rules = {
  allowSemicolon: boolean;
  requireSemicolon: boolean;
  invalidTokens: RegExp[];
  printKeyword: string;

  // optional per-language semantic override
  needsSemicolon?: (line: string) => boolean;
  includeValidator?: (line: string) => boolean;
  languageFingerprint?: {
    requiredPatterns?: RegExp[];
    forbiddenPatterns?: RegExp[];
  };
  semicolonRules?: {
    requiresSemicolon?: (line: string) => boolean;
  };
};
