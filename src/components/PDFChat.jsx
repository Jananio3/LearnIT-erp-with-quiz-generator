import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/PDFChat.css";
import Cookies from "js-cookie";
import { db } from "../config/firebase-config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";



const PDFChat = () => {
  const [pdfs, setPdfs] = useState([]);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSession, setActiveSession] = useState("current");
  const userId = Cookies.get("userId");

  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        const q = query(
          collection(db, "pdfchat"),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const sessions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChatSessions(sessions);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    if (userId) fetchChatSessions();
  }, [userId]);

  const handleFileUpload = (e) => {
    setPdfs([...e.target.files]);
  };

  const processPDFs = async () => {
    setProcessing(true);
    const formData = new FormData();
    pdfs.forEach((pdf) => formData.append("pdfs", pdf));

    try {
      await axios.post("http://localhost:3001/process-pdfs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Create new session entry
      const newSession = {
        userId,
        title: pdfs[0]?.name || "New Chat",
        messages: [],
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "pdfchat"), newSession);
      setChatSessions((prev) => [...prev, { ...newSession, id: docRef.id }]);
      setActiveSession(docRef.id);
      setChatHistory([]);
    } catch (error) {
      console.error("Error processing PDFs:", error);
    }
    setProcessing(false);
  };

  const handleQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3001/ask-question", {
        question,
      });
      const newEntry = { question, answer: response.data.answer };

      if (activeSession === "current") {
        const newSession = {
          userId,
          title: question.substring(0, 20) + "...",
          messages: [newEntry],
          createdAt: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, "pdfchat"), newSession);

        setChatSessions((prev) => [...prev, { id: docRef.id, ...newSession }]); // ✅ Fix
        setActiveSession(docRef.id);
        setChatHistory([newEntry]);
      } else {
        const updatedHistory = [...chatHistory, newEntry];
        setChatHistory(updatedHistory);
        await updateDoc(doc(db, "pdfchat", activeSession), {
          messages: updatedHistory,
          lastUpdated: new Date().toISOString(),
        });
      }

      setQuestion("");
    } catch (error) {
      console.error("Error asking question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatSession = async (sessionId) => {
    if (sessionId === "current") {
      setActiveSession("current");
      setChatHistory([]);
      return;
    }

    const session = chatSessions.find((s) => s.id === sessionId);
    if (session) {
      setActiveSession(session.id);
      setChatHistory(session.messages);
    }
  };

  return (
    <div className="pdf-chat-page">
      <div className="pdf-chat-container">
        <div className="sidebar">
          <h2>Upload PDFs</h2>
          <input
            type="file"
            multiple
            accept="application/pdf"
            onChange={handleFileUpload}
            className="file-input"
          />
          <button
            onClick={processPDFs}
            disabled={processing || pdfs.length === 0}
            className="btn-process"
          >
            {processing ? "Processing..." : "Process PDFs"}
          </button>

          <div className="chat-tabs">
            <div
              className={`chat-tab ${
                activeSession === "current" ? "active" : ""
              }`}
              onClick={() => loadChatSession("current")}
            >
              <p style={{ cursor: "pointer", border: "none" }}>Current Chat</p>
            </div>
            {chatSessions.map((session) => (
              <div
                key={session.id}
                className={`chat-tab ${
                  activeSession === session.id ? "active" : ""
                }`}
                onClick={() => loadChatSession(session.id)}
              >
                <p>{session.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-area">
          <h1>Chat with PDFs</h1>
          <form onSubmit={handleQuestion} className="chat-form">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about the PDFs"
              className="chat-input"
              disabled={processing}
            />
            <button type="submit" className="btn-ask" disabled={isLoading}>
              {isLoading ? "Loading..." : "Ask"}
            </button>
          </form>

          <div className="chat-history">
            {chatHistory.map((entry, index) => (
              <div key={index} className="chat-entry">
                <h3>Q: {entry.question}</h3>
                <p>
                  <strong>A:</strong>
                  {entry.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFChat;
