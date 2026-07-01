import React, { useState, useCallback } from "react";
import { db } from "../config/firebase-config";
import { collection, addDoc, getDoc, doc } from "firebase/firestore";
import Cookies from "js-cookie";
import { Form, Button, Container, Alert, Spinner } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import "./css/UploadNotes.css"; // Custom CSS for additional styling
import { useLocation } from "react-router-dom";

function UploadNotes() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const location = useLocation();
  const { subject, year } = location.state || {};

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc", ".docx"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    multiple: false,
  });

  // Function to extract file extension
  const getFileExtension = (filename) => {
    const fileParts = filename.split(".");
    return fileParts.length > 1 ? fileParts.pop() : "";
  };

  // Handle form submission
  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file || !title) {
      setError("Please select a file and enter a title.");
      return;
    }

    setUploading(true);

    // inside handleUpload
    try {
      const userId = Cookies.get("userId");
      const role = Cookies.get("role");

      if (!userId || !role) {
        setError("User authentication failed. Please log in again.");
        setUploading(false);
        return;
      }

      const userDocRef = doc(
        db,
        role === "teacher" ? "teachers" : "students",
        userId
      );
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        setError("User does not exist in the database.");
        setUploading(false);
        return;
      }

      const fileExtension = getFileExtension(file.name);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64File = reader.result.split(",")[1];

        const noteData = {
          title,
          file: base64File,
          fileName: file.name,
          fileExtension,
          uploadedBy: userId,
          uploadedAt: new Date(),
        };

        // Add subject and year only if teacher
        if (role === "teacher") {
          noteData.subject = subject || "";
          noteData.year = year || "";
        }

        await addDoc(collection(db, "notes"), noteData);

        setSuccess("File uploaded successfully!");
        setTitle("");
        setFile(null);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-notes-page d-flex align-items-center justify-content-center bodycont">
      <Container className="upload-notes-container">
        <div className="card upload-notes-card shadow-lg">
          <div className="card-body p-5">
            <h2 className="text-center mb-4 font-weight-bold">Upload Notes</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleUpload}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter note title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Upload File</Form.Label>
                <div
                  {...getRootProps()}
                  className={`dragdrop-area ${isDragActive ? "active" : ""}`}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <p className="text-center">📄 {file.name} uploaded</p>
                  ) : isDragActive ? (
                    <p className="text-center">📂 Drop the file here...</p>
                  ) : (
                    <p className="text-center">
                      📁 Drag & drop a file here, or click to select one
                    </p>
                  )}
                </div>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                disabled={uploading}
                className="w-100"
              >
                {uploading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Upload"
                )}
              </Button>
            </Form>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default UploadNotes;
