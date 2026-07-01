import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./css/Uploader.css"; // Custom CSS for additional styling

const Uploader = ({ questions, setQuestions }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Reset questions when returning to the uploader page
    setQuestions([]);
    setFile(null);
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleGenerateQuiz = async () => {
    if (!file) {
      alert("Please upload a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3001/generate-quiz",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setQuestions(response.data.questions);
      navigate("/quiz"); // Navigate only after setting questions
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uploader-page d-flex align-items-center justify-content-center">
      <div className="uploader-container">
        <div className="card uploader-card shadow-lg">
          <div className="card-body p-5">
            <h1 className="text-center mb-4 font-weight-bold">Generate Quiz</h1>
            <div
              className={`dragdrop-area ${isDragActive ? "active" : ""}`}
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              {file ? (
                <p className="text-center">📄 {file.name} uploaded</p>
              ) : isDragActive ? (
                <p className="text-center">📂 Drop the file here...</p>
              ) : (
                <p className="text-center">
                  📁 Drag & drop a PDF file here, or click to select one
                </p>
              )}
            </div>
            <button
              onClick={handleGenerateQuiz}
              disabled={loading || !file}
              className="btn btn-primary w-100 mt-4"
            >
              {loading ? "Generating Quiz..." : "Generate Quiz"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Uploader;
