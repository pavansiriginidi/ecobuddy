import React, { useEffect, useState } from "react";

const CHAT_HISTORY_KEY = "ecoChatHistory";

function Chatbot({ message, forceOpen }) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch {
      return [];
    }
  });

  const renderFormattedMessage = (text) => {
    if (!text) return null;
    
    const normalizedText = String(text || "").replace(/<br\s*\/?>/gi, "\n").trim();
    const lines = normalizedText.split(/\n+/).filter(Boolean);

    const renderInline = (line, lineIndex) => {
      const parts = [];
      // Match **text** or <b>text</b> patterns
      const pattern = /(\*\*[^*]+\*\*|<b>.*?<\/b>)/gi;
      let lastIndex = 0;
      let match;

      while ((match = pattern.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.slice(lastIndex, match.index));
        }

        const raw = match[0];
        const boldText = raw.replace(/^\*\*|\*\*$/g, "").replace(/^<b>|<\/b>$/gi, "");
        parts.push(
          <strong key={`${lineIndex}-${match.index}`} style={{ color: "#10b981" }}>
            {boldText}
          </strong>
        );
        lastIndex = pattern.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex));
      }

      return parts.length > 0 ? parts : line;
    };

    return lines.map((line, lineIndex) => (
      <div key={`${lineIndex}-${line.slice(0, 12)}`} className="chat-line" style={{ marginBottom: "8px" }}>
        {renderInline(line, lineIndex)}
      </div>
    ));
  };

  useEffect(() => {
    if (forceOpen && message) {
      setOpen(true);
      const nextMessage = String(message);
      const isLoadingMessage = nextMessage.startsWith(
        "💬 Looking up the best eco-friendly option for "
      );

      if (isLoadingMessage) {
        setHistory([nextMessage]);
        return;
      }

      setHistory((prev) => {
        const lastMessage = prev[prev.length - 1];
        const isReplacingLoadingState =
          typeof lastMessage === "string" &&
          lastMessage.startsWith("💬 Looking up the best eco-friendly option for ");

        if (isReplacingLoadingState) {
          return [...prev.slice(0, -1), nextMessage];
        }

        if (lastMessage === nextMessage) {
          return prev;
        }

        return [...prev, nextMessage];
      });
    }
  }, [forceOpen, message]);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history.slice(-20)));
    } catch {
      // Ignore storage failures in private browsing or restricted environments.
    }
  }, [history]);

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    } catch {
      // Ignore storage failures.
    }
  };

  return (
    <>
      <button
        type="button"
        className="eco-btn"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chatbot" : "Open chatbot"}
        aria-expanded={open}
      >
        <span className="eco-btn-icon" aria-hidden="true">🤖</span>
      </button>
      {open && (
        <div className="chatbot" role="dialog" aria-labelledby="chatbot-title">
          <div className="chat-header" id="chatbot-title">
            <div className="chat-header-title">
              <span>EcoBuddy ♻️</span>
              <span className="chat-header-subtitle">Suggestion history</span>
            </div>
            <button
              type="button"
              className="chat-clear-btn"
              onClick={clearHistory}
              aria-label="Clear chatbot history"
            >
              Clear
            </button>
            <button 
              className="close-btn" 
              onClick={() => setOpen(false)}
              aria-label="Close chatbot"
              type="button"
            >
              ×
            </button>
          </div>
          <div className="chat-body-scroll">
            {history.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>💡 Add items to your cart to build your eco suggestion history!</p>
            ) : (
              history.map((msg, index) => (
                <div key={index} className="chat-msg">
                  {renderFormattedMessage(msg)}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
