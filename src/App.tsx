/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from "react";
import {
  Files,
  Search,
  GitBranch,
  Play,
  Settings,
  FileUp,
  Trash2,
  Binary,
} from "lucide-react";
import "./App.css";
import { sampleTokens } from "./data/tokens";
import { analyzeCode } from "./utils/analyzeCode";
import type { LanguageStyle, AnalyzerResult } from "./types";
import { tokenize } from "./utils/lexer";

const App: React.FC = () => {
  const [code, setCode] = useState("");
  const [lang, setLang] = useState<LanguageStyle>("CPP");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<AnalyzerResult>({
    tokens: tokenize(code, lang),
    lexErrors: [],
    synErrors: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleScroll = (
    e: React.UIEvent<HTMLTextAreaElement | HTMLDivElement>,
  ) => {
    const scrollTop = e.currentTarget.scrollTop;

    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollTop;
    }

    if (textareaRef.current) {
      textareaRef.current.scrollTop = scrollTop;
    }
    if (lineRef.current) {
      lineRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };
  const lines = code.split("\n");

  const handleLanguageChange = (newLang: LanguageStyle) => {
    setLang(newLang);

    const analyzedResults = analyzeCode(code, newLang);

    setResults({
      ...analyzedResults,
      tokens: tokenize(code, newLang),
    });
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    setCode(value);

    const analyzedResults = analyzeCode(value, lang);

    setResults({
      ...analyzedResults,
      tokens: tokenize(code, lang),
    });

    // 🔥 FIX: keep cursor visible after paste/type
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;

      el.scrollTop = el.scrollHeight;
    });
  };

  return (
    <div className="page-wrapper">
      <div className="vscode-container">
        <div className="browser-bar">
          <div className="browser-dots">
            <span />
            <span />
            <span />
          </div>

          <div className="browser-address">localhost:5173 / web-parser-ide</div>
        </div>

        <aside className="activity-bar">
          <div className="top-icons">
            <Files size={22} className="active" />
            <Search size={22} />
            <GitBranch size={22} />
            <Play size={22} style={{ color: "#4ec9b0", cursor: "pointer" }} />
          </div>

          <div className="bottom-icons">
            <Settings size={22} />
          </div>
        </aside>

        <aside className="sidebar">
          <div className="sidebar-header">EXPLORER</div>

          <div className="sidebar-section">
            <div className="section-title">TOKENS</div>

            <div className="token-list">
              {results.tokens.map((token, index) => (
                <div key={index} className="token-item">
                  <div className="token-left">
                    <Binary size={12} />
                    <span>
                      L{token.line} - {token.value}
                    </span>
                  </div>
                  <small>{token.type}</small>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="main-editor">
          <div className="tabs-container">
            <div className="tab">
              {lang.toLowerCase()}_fragment.
              {lang === "PYTHON" ? "py" : lang === "JS" ? "js" : "cpp"}
            </div>

            <div className="editor-actions">
              <select
                value={lang}
                onChange={(e) =>
                  handleLanguageChange(e.target.value as LanguageStyle)
                }
              >
                <option value="CPP">C++</option>
                <option value="PYTHON">Python</option>
                <option value="JS">JavaScript</option>
              </select>

              <button onClick={() => fileInputRef.current?.click()}>
                <FileUp size={14} />
              </button>

              <button
                onClick={() => {
                  setCode("");
                  setResults({
                    tokens: tokenize("", lang),
                    lexErrors: [],
                    synErrors: [],
                  });
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="editor-workspace">
            <div
              className="editor-scroll"
              ref={scrollRef}
              onScroll={handleScroll}
            >
              <div className="line-numbers" ref={lineRef}>
                {lines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              <textarea
                ref={editorRef}
                value={code}
                onChange={handleCodeChange}
                onScroll={handleScroll}
                placeholder="Start typing your code here..."
                spellCheck={false}
              />
            </div>
          </div>

          <footer className="terminal-panel">
            <div className="terminal-tabs">
              <span className="active">PROBLEMS</span>
              <span>OUTPUT</span>
              <span>TERMINAL</span>
            </div>

            <div className="terminal-content">
              {results.lexErrors.length > 0 || results.synErrors.length > 0 ? (
                <>
                  {results.lexErrors.map((err, index) => (
                    <div key={`lex-${index}`} className="error-row">
                      LEX: {err}
                    </div>
                  ))}

                  {results.synErrors.map((err, index) => (
                    <div key={`syn-${index}`} className="error-row">
                      SYN: {err}
                    </div>
                  ))}
                </>
              ) : (
                <div className="success-row">No problems detected.</div>
              )}
            </div>
          </footer>
        </main>

        <input type="file" ref={fileInputRef} hidden />
      </div>
    </div>
  );
};

export default App;
