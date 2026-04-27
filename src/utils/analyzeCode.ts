/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AnalyzerResult, LanguageStyle } from "../types";
import { languageRules } from "../data/languageRules";

export function analyzeCode(code: string, lang: LanguageStyle): AnalyzerResult {
  const rules = languageRules[lang];

  const lines = code.split("\n");

  const lexErrors: string[] = [];
  const synErrors: string[] = [];

  // 🔴 LANGUAGE IDENTITY CHECK (soft detection only)
  const fingerprint = rules.languageFingerprint;

  if (fingerprint) {
    const codeText = code;

    const hasForbidden = fingerprint.forbiddenPatterns?.some((regex) =>
      regex.test(codeText),
    );

    if (hasForbidden) {
      lexErrors.push(`Line 1: code contains invalid ${lang} syntax`);
    }

    const matches =
      fingerprint.requiredPatterns?.filter((r) => r.test(codeText)).length ?? 0;

    const confidence = fingerprint.requiredPatterns?.length
      ? matches / fingerprint.requiredPatterns.length
      : 1;

    // NOTE: confidence is currently unused (intentional)
  }

  lines.forEach((line, i) => {
    const lineNo = i + 1;
    const trimmed = line.trim();

    if (!trimmed) return;

    // 🔴 C++ include validation
    if (lang === "CPP" && rules.includeValidator) {
      if (trimmed.startsWith("#include")) {
        if (!rules.includeValidator(trimmed)) {
          lexErrors.push(
            `Line ${lineNo}: invalid include syntax (use <...> or "...")`,
          );
        }
      }
    }

    // 🔴 shared lexical validation
    rules.invalidTokens.forEach((regex) => {
      if (regex.test(trimmed)) {
        lexErrors.push(`Line ${lineNo}: invalid token for ${lang}`);
      }
    });

    const hasSemicolon = trimmed.endsWith(";");

    // 🔵 C++ semicolon logic
    if (lang === "CPP") {
      const needs = rules.needsSemicolon?.(trimmed) ?? false;

      if (needs && !hasSemicolon) {
        synErrors.push(`Line ${lineNo}: missing semicolon`);
      }
    }

    // 🔵 Python rule
    if (lang === "PYTHON") {
      if (hasSemicolon) {
        synErrors.push(`Line ${lineNo}: semicolons not allowed in Python`);
      }
    }

    // 🔵 JavaScript-specific rule (FIXED: now active)
    if (lang === "JS") {
      if (
        trimmed.startsWith("return") ||
        trimmed.startsWith("throw") ||
        trimmed.startsWith("break") ||
        trimmed.startsWith("continue")
      ) {
        if (!hasSemicolon) {
          synErrors.push(
            `Line ${lineNo}: missing semicolon in control statement`,
          );
        }
      }
    }
  });

  // 🔵 brace validation (C++ / JS only)
  if (lang !== "PYTHON") {
    let balance = 0;

    for (const ch of code) {
      if (ch === "{") balance++;
      if (ch === "}") balance--;

      if (balance < 0) {
        synErrors.push("Unexpected closing brace");
        break;
      }
    }

    if (balance !== 0) {
      synErrors.push("Mismatched braces");
    }
  }

  // 🔵 parentheses validation (JS / CPP)
  if (lang === "JS" || lang === "CPP") {
    let paren = 0;

    for (const ch of code) {
      if (ch === "(") paren++;
      if (ch === ")") paren--;

      if (paren < 0) {
        synErrors.push("Unexpected closing parenthesis ')'");
        break;
      }
    }

    if (paren !== 0) {
      synErrors.push("Mismatched parentheses '()'");
    }
  }

  return {
    tokens: [],
    lexErrors,
    synErrors,
  };
}
