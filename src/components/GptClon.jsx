import { useState, useRef } from "react";
import axios from "axios";

const GptClon = () => {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const controllerRef = useRef(null); // Abort Controller Reference

  const API_KEY = "AIzaSyB5YjeGOAlbtHRNgdHl5r3pqYm4X7M1RFk"; // Replace with your actual API key

  const generateAnswer = async () => {
    if (!question.trim()) return;

    const newMessage = { text: question, sender: "user" };
    setMessages((prev) => [...prev, newMessage]);
    setQuestion(""); // Clear input field
    setIsTyping(true);

    // Cancel any previous request if needed
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          contents: [{ parts: [{ text: question }] }],
        },
        {
          headers: { "Content-Type": "application/json" },
          signal: controllerRef.current.signal, // Attach Abort Signal
        }
      );

      const botReply = response.data.candidates[0].content.parts[0].text;
      setMessages((prev) => [...prev, { text: botReply, sender: "bot" }]);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
      } else {
        console.error("Error:", error);
      }
    }

    setIsTyping(false);
    setTimeout(
      () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent new line in input
      generateAnswer();
    }
  };

  const stopAnswer = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-semibold mb-4">What can I help with?</h1>

      {/* Chat Box */}
      <div className="w-full max-w-2xl h-[500px]  rounded-lg p-4 overflow-y-auto flex flex-col font-inter space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 max-w-[70%] rounded-xl text-sm leading-relaxed break-words 
              ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white text-left font-sans text-[15px]"
                  : "bg-gray-700 text-white text-left font-sans text-[15px]"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && <p className="text-gray-400 italic">Typing...</p>}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl p-4 flex items-center space-x-2 mt-4">
        <input
          type="text"
          placeholder="Message ChatGPT..."
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 px-3"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown} // Enter to send message
        />
        <button
          onClick={generateAnswer}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
        {isTyping && (
          <button
            onClick={stopAnswer}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Stop
          </button>
        )}
      </div>
      <div className="my-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 justify-center">
        {[
          { text: "Summarize text", icon: "📄" },
          { text: "Make a plan", icon: "📝" },
          { text: "Get advice", icon: "🎓" },
          { text: "Brainstorm", icon: "💡" },
          { text: "Code", icon: "📜" },
          { text: "More", icon: "➕" },
        ].map((item, index) => (
          <button
            key={index}
            className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 flex items-center justify-center space-x-2 text-sm w-full"
          >
            <span>{item.icon}</span>
            <span>{item.text}</span>
          </button>
        ))}
      </div>

      {/* Terms & Conditions */}
      <p className="absolute bottom-2 mt-2 left-1/2 transform -translate-x-1/2 text-gray-500 text-xs text-center px-4 md:text-sm md:bottom-2">
        By messaging ChatGPT, you agree to our{" "}
        <a href="#" className="underline">
          Terms
        </a>{" "}
        and have read our{" "}
        <a href="#" className="underline">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
};

export default GptClon;
