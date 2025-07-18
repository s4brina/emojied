import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import emojiData from "../emoji.json";

type Emoji = {
  char: string;
  name: string;
  codes: string;
};

export default function EmojiSearch() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Emoji[]>([]);
  const [copiedEmoji, setCopiedEmoji] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [saveAsPNG, setSaveAsPNG] = useState<boolean>(false); // false = copy mode, true = save mode

  const fuse = useMemo(() => {
    return new Fuse<Emoji>(emojiData, {
      keys: ["name"],
      threshold: 0.3,
    });
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const res = fuse.search(query);
    setResults(res.map((r) => r.item));
  }, [query, fuse]);

  useEffect(() => {
    if (copiedEmoji) {
      const timeout = setTimeout(() => setCopiedEmoji(null), 1500);
      return () => clearTimeout(timeout);
    }
  }, [copiedEmoji]);

  const saveEmojiAsPNG = (emojiChar: string) => {
    const canvas = document.createElement("canvas");
    const size = 128;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    ctx.font = `${size * 0.8}px serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(emojiChar, size / 2, size / 2);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `emoji-${emojiChar.codePointAt(0)?.toString(16)}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setCopiedEmoji(`Saved ${emojiChar} as PNG`);
    });
  };

  const handleEmojiClick = (emoji: Emoji) => {
    if (!saveAsPNG) {
      navigator.clipboard.writeText(emoji.char);
      setCopiedEmoji(emoji.char);
    } else {
      saveEmojiAsPNG(emoji.char);
    }
  };

  return (
    <div
      style={{
        "--primary-color": "#4f46e5",
        "--bg-color": "#fefefe",
        "--text-color": "#333",
        "--shadow-light": "rgba(0,0,0,0.01)",
        maxWidth: 1000,
        margin: "3rem auto",
        padding: "1rem 2rem 3rem",
        fontFamily: "'Inter', sans-serif",
        backgroundColor: "var(--bg-color)",
        boxShadow: "0 8px 24px var(--shadow-light)",
        borderRadius: 30,
        position: "relative",
      } as React.CSSProperties}
    >
      {/* About button */}
      <button
        onClick={() => setShowAbout((v) => !v)}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          backgroundColor: "transparent",
          border: "none",
          color: "var(--primary-color)",
          fontWeight: "600",
          fontSize: "1rem",
          cursor: "pointer",
          padding: "0.25rem 0.5rem",
          borderRadius: 6,
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#eef2ff")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        aria-expanded={showAbout}
        aria-controls="about-info"
      >
        About
      </button>

      {showAbout && (
        <div
          id="about-info"
          style={{
            position: "absolute",
            top: 60,
            right: 20,
            backgroundColor: "#f9fafb",
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: "1rem 1.5rem",
            boxShadow: "0 8px 16px rgba(0,0,0,0.05)",
            width: 280,
            fontSize: 14,
            color: "#555",
            zIndex: 10,
          }}
        >
          This is an ad-free emoji search tool. Copy emojis or download as PNG — you can do both, no hassle.
        </div>
      )}

      {/* Toggle Switch */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "1rem auto 2rem",
          maxWidth: 400,
          gap: 12,
          fontSize: 16,
          fontWeight: "500",
          color: "var(--text-color)",
          userSelect: "none",
        }}
      >
        <span>Copy Emoji</span>
        <label
          style={{
            position: "relative",
            display: "inline-block",
            width: 50,
            height: 26,
          }}
        >
          <input
            type="checkbox"
            checked={saveAsPNG}
            onChange={() => setSaveAsPNG(!saveAsPNG)}
            style={{
              opacity: 0,
              width: 0,
              height: 0,
            }}
          />
          <span
            style={{
              position: "absolute",
              cursor: "pointer",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: saveAsPNG ? "#4f46e5" : "#ccc",
              borderRadius: 26,
              transition: "0.4s",
            }}
          />
          <span
            style={{
              position: "absolute",
              content: '""',
              height: 20,
              width: 20,
              left: saveAsPNG ? 26 : 4,
              bottom: 3,
              backgroundColor: "white",
              borderRadius: "50%",
              transition: "0.4s",
              boxShadow: "0 0 2px rgba(0,0,0,0.2)",
            }}
          />
        </label>
        <span>Save as PNG</span>
      </div>

      <h1
        style={{
          textAlign: "center",
          fontWeight: "500",
          fontSize: "4rem",
          marginBottom: "2rem",
          color: "var(--text-color)",
          marginTop: "0",
        }}
      >
        Emojied 🔎
      </h1>

      <input
        aria-label="Search emojis by name or mood"
        type="text"
        placeholder="Type a word or mood..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 400,
          fontSize: "1.125rem",
          padding: "0.625rem 1rem",
          borderRadius: 15,
          border: "1.5px solid #ddd",
          margin: "0 auto",
          display: "block",
          boxSizing: "border-box",
          transition: "border-color 0.25s ease",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary-color)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#ddd")}
      />

      <div
        style={{
          marginTop: 28,
          display: "flex",
          flexWrap: "wrap",
          gap: 18,
          fontSize: 50,
          justifyContent: "center",
          minHeight: 140,
          userSelect: "none",
          transition: "opacity 0.3s ease",
          opacity: results.length === 0 && query.trim() !== "" ? 0.6 : 1,
        }}
      >
        {results.length === 0 && query.trim() !== "" && (
          <p
            style={{
              color: "#999",
              fontSize: 20,
              width: "100%",
              textAlign: "center",
              marginTop: 40,
            }}
          >
            No emojis found
          </p>
        )}

        {results.slice(0, 40).map((emoji) => (
          <div
            key={emoji.codes}
            title={emoji.name}
            style={{
              cursor: "pointer",
              borderRadius: 14,
              padding: "0.4em 0.8em",
              transition: "background-color 0.3s, transform 0.3s, box-shadow 0.3s",
              boxShadow: "0 2px 6px rgba(0,0,0,0.01)",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
              width: 64,
              height: 64,
              fontSize: 48,
              filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.01))",
            }}
            onClick={() => handleEmojiClick(emoji)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#eef2ff";
              e.currentTarget.style.transform = "scale(1.15)";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(79, 70, 229, 0.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.01)";
            }}
          >
            {emoji.char}
          </div>
        ))}
      </div>

      {copiedEmoji && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "var(--primary-color)",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            borderRadius: 9999,
            fontWeight: "600",
            fontSize: "1rem",
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.1)",
            userSelect: "none",
            pointerEvents: "none",
            opacity: 0.9,
            transition: "opacity 0.3s ease",
            whiteSpace: "nowrap",
          }}
        >
          {saveAsPNG ? copiedEmoji : `Copied ${copiedEmoji} to clipboard!`}
        </div>
      )}

      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          fontSize: 14,
          color: "#999",
          fontFamily: "'Inter', sans-serif",
          userSelect: "none",
          padding: "12px 0 20px",
          backgroundColor: "transparent",
          zIndex: -10,
        }}
      >
        Sabrina Dragani 2025
      </footer>
    </div>
  );
}
