import React, { useState, useEffect } from "react";
import { db } from "../config/firebase-config";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import Cookies from "js-cookie";
import { Card, Button, Spinner, Alert, Container, Row, Col } from "react-bootstrap";
import "./css/FetchUploads.css"; // Custom CSS for additional styling

function ViewTeacherNotes() {
  const [teacherUploads, setTeacherUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const userId = Cookies.get("userId");
        const role = Cookies.get("role");

        if (!userId || !role) {
          setError("User authentication failed. Please log in.");
          setLoading(false);
          return;
        }

        // Fetch user organization
        const userDocRef = doc(db, role === "teacher" ? "teachers" : "students", userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          setError("User does not exist in the database.");
          setLoading(false);
          return;
        }

        // Fetch notes uploaded by the user (self-uploaded)
        const teacherNotesQuery = query(collection(db, "notes"), where("uploadedBy", "==", userId));
        const teacherNotesSnapshot = await getDocs(teacherNotesQuery);
        const teacherNotes = teacherNotesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

          
        setTeacherUploads(teacherNotes);
      } catch (err) {
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, []);

  // Function to download the file
  const handleDownload = (base64File, fileName, fileExtension) => {
    if (!fileExtension) {
      alert("File extension is missing");
      return;
    }

    const byteCharacters = atob(base64File);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    const fileBlob = new Blob(byteArrays, { type: `application/${fileExtension}` });
    const fileURL = URL.createObjectURL(fileBlob);
    const link = document.createElement("a");

    const downloadName = fileName ? `${fileName}.${fileExtension}` : `download.${fileExtension}`;
    link.href = fileURL;
    link.download = downloadName;
    link.click();
  };

  return (
    <div className="fetch-uploads-page">
      <Container className="py-5">
        <h2 className="text-center mb-4 font-weight-bold">Uploaded Notes</h2>
        {loading && (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}
        {error && <Alert variant="danger" className="text-center">{error}</Alert>}

        {/* Display Teacher's Notes */}
        {teacherUploads.length > 0 && (
          <>
            <h3 className="text-start mt-5 mb-3 ">Your Notes:</h3>
            <Row className="justify-content-start">
              {teacherUploads.map((upload) => (
                <Col md={4} key={upload.id}>
                  <Card className="m-3 upload-card">
                    <Card.Body className="text-center">
                      <Card.Title className="mb-3">{upload.title}</Card.Title>
                      <Card.Text className="text-muted">
                        Uploaded on: {upload.uploadedAt?.toDate().toLocaleDateString()}
                      </Card.Text>
                      <Button
                        variant="primary"
                        onClick={() =>
                          handleDownload(upload.file, upload.title, upload.fileExtension)
                        }
                        className="w-100"
                      >
                        Download File
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}

        {/* No Notes Found */}
        {teacherUploads.length === 0 && !loading && (
          <Alert variant="warning" className="text-center mt-4">No notes available.</Alert>
        )}
      </Container>
    </div>
  );
}

export default ViewTeacherNotes;
