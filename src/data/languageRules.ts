import type { LanguageStyle, Rules } from "../types";

export const languageRules: Record<LanguageStyle, Rules> = {
  CPP: {
    allowSemicolon: true,
    requireSemicolon: true,
    printKeyword: "cout",
    invalidTokens: [/console\.log/, /print\(/],
    languageFingerprint: {
      requiredPatterns: [/#include/, /\bint\s+main\s*\(/],
      forbiddenPatterns: [/def\s+\w+\s*\(/, /console\.log/, /\bfunction\b/],
    },
    needsSemicolon: (line: string) => {
      const t = line.trim();

      // preprocessing
      if (t.startsWith("#")) return false;

      // declarations / namespaces
      if (
        t.startsWith("using") ||
        t.startsWith("namespace") ||
        t.startsWith("class") ||
        t.startsWith("struct")
      )
        return false;

      // control flow headers
      if (
        t.startsWith("if") ||
        t.startsWith("for") ||
        t.startsWith("while") ||
        t.startsWith("switch") ||
        t.startsWith("else") ||
        t.startsWith("do")
      )
        return false;

      // blocks
      if (t.endsWith("{") || t.endsWith("}")) return false;

      // function signatures/definitions
      if (/\)\s*(\{|$)/.test(t)) return false;

      return true;
    },

    includeValidator: (line: string) => {
      const t = line.trim();
      if (!t.startsWith("#include")) return true;

      // C++ ONLY valid forms:
      return /^#include\s*<[^>]+>$/.test(t) || /^#include\s*"[^"]+"$/.test(t);
    },
  },

  PYTHON: {
    allowSemicolon: true,
    requireSemicolon: false,
    printKeyword: "print",
    invalidTokens: [/cout/, /console\.log/],

    languageFingerprint: {
      requiredPatterns: [
        /\bdef\b/, // function usage (strong signal)
        /\bimport\b/, // module usage
        /\bprint\s*\(/, // script-style signal
        /^[a-zA-Z_]\w*\s*=/, // variable assignment signal
      ],
      forbiddenPatterns: [/#include/, /console\.log/, /\bfunction\b/],
    },
  },

  JS: {
    allowSemicolon: true,

    semicolonRules: {
      requiresSemicolon: (line: string) => {
        const t = line.trim();
        return (
          t.startsWith("return") ||
          t.startsWith("throw") ||
          t.startsWith("break") ||
          t.startsWith("continue")
        );
      },
    },

    printKeyword: "console.log",
    invalidTokens: [/cout/],

    languageFingerprint: {
      requiredPatterns: [
        /\bfunction\b/, // function style
        /\bconst\b|\blet\b|\bvar\b/, // variable declarations
        /console\.log/, // runtime usage signal
      ],
      forbiddenPatterns: [/#include/, /def\s+\w+\s*\(/],
    },

    needsSemicolon: (line: string) => {
      const t = line.trim();

      if (
        t.startsWith("return") ||
        t.startsWith("throw") ||
        t.startsWith("break") ||
        t.startsWith("continue")
      ) {
        return true;
      }

      return false;
    },
    requireSemicolon: false,
  },
};
