import { useEffect, useRef, useState } from "react";

type Msg = { from: "user" | "bot"; text: string };

export default function ChatBot() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "bot",
      text: "Hi! Ask me about local air quality or tips to stay safe.",
    },
  ]);
  const [input, setInput] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");

    // simple rule-based reply
    const reply = ruleReply(text);
    setTimeout(
      () => setMessages((m) => [...m, { from: "bot", text: reply }]),
      300
    );
  }

  function ruleReply(text: string) {
    const lower = text.toLowerCase();
    if (lower.includes("aqi") || lower.includes("air"))
      return "Current AQI shows recent readings; check the dashboard for details.";
    if (lower.includes("tips") || lower.includes("health"))
      return "Avoid prolonged outdoor exertion when AQI is high; use masks if needed.";
    if (lower.includes("forecast") || lower.includes("prediction"))
      return "The predictions chart shows a 7-day forecast of AQI.";
    return "I'm not sure — try asking about 'AQI', 'health', or 'tips'.";
  }

  // removed AI fetch and API-key UI per user request; ChatBot runs rule-based replies only

  return (
    <div className="bg-white rounded-xl shadow-lg w-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold text-sm">Air Assistant</h3>
      </div>

      <div
        ref={scrollRef}
        className="h-56 overflow-y-auto p-3 space-y-3 bg-gray-50"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg shadow ${
                m.from === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t bg-white">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Ask about AQI, tips, or forecasts"
            aria-label="Chat message"
            autoFocus
          />
          <button
            onClick={send}
            className="bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
