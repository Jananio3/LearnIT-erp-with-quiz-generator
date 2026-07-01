import React, { useState } from "react";
import axios from "axios";

function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const fetchStuff = async () => {
    try {
      const resp = await axios.post("http://localhost:3001/deepseek", {
        message,
      });
      setResponse(resp.data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <input
        type="text"
        onChange={(e) => setMessage(e.target.value)}
        value={message}
      />
      <button onClick={fetchStuff} >Click</button>
      <p>{response}</p>
    </div>
  );
}

export default Home;
