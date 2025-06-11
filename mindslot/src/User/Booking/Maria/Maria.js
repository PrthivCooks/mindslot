import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css"; // Import styles
import axios from "axios";

const GEMINI_API_KEY = "AIzaSyBJs0fd1zR1WnAq5pwTeC7iy8S8KZrdEXE"; // 🔑 Your API Key

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I’m Maria, your AI Counsellor. How can I help you today?" }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // ✅ Scroll to the latest message automatically
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Function to send user message
  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const newMessage = { sender: "user", text: inputText };
    const updatedMessages = [...messages, newMessage];

    setMessages(updatedMessages);
    setInputText("");
    setLoading(true);

    try {
      // 🔥 Send conversation history to Gemini API for context-aware responses
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta3/models/gemini-pro:generateMessage?key=${GEMINI_API_KEY}`,
        {
          prompt: {
            messages: updatedMessages.map(msg => ({ role: msg.sender === "user" ? "user" : "model", parts: [{ text: msg.text }] }))
          }
        }
      );

      const botReply = response.data.candidates[0]?.content?.parts[0]?.text || "I'm not sure how to respond to that.";
      
      setMessages([...updatedMessages, { sender: "bot", text: botReply }]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages([...updatedMessages, { sender: "bot", text: "Oops! Something went wrong. Please try again." }]);
    }

    setLoading(false);
  };

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <img src="/mnt/data/image.png" alt="Maria" className="bot-avatar" />
        <div className="bot-info">
          <h2>Maria</h2>
          <p>AI Counsellor</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="chat-bubble bot">Typing...</div>}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input Box */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Write your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
};

export default Chatbot;
