import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import "./css/NotesGenerator.css"; // <-- custom styles

const NoteGenerator = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notesPdf, setNotesPdf] = useState(null);

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

  const handleGenerateNotes = async () => {
    if (!file) {
      alert("Please upload a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    setLoading(true);
    setNotesPdf(null);

    try {
      const response = await axios.post(
        "http://localhost:3001/generate-notes",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.notes) {
        setNotesPdf(response.data.notes);
      }
    } catch (error) {
      console.error("Error generating notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadNotes = () => {
    if (!notesPdf) return;

    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${notesPdf}`;
    link.download = "Generated_Notes.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="note-page d-flex align-items-center justify-content-center">
      <div className="note-container">
        <div className="card note-card shadow-lg">
          <div className="card-body p-5">
            <h1 className="text-center mb-4 font-weight-bold">Generate Notes</h1>
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
              onClick={handleGenerateNotes}
              disabled={loading || !file}
              className="btn btn-primary w-100 mt-4"
            >
              {loading ? "Generating Notes..." : "Generate Notes"}
            </button>

            {notesPdf && (
              <button
                onClick={handleDownloadNotes}
                className="btn btn-success w-100 mt-3"
              >
                Download Notes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteGenerator;
