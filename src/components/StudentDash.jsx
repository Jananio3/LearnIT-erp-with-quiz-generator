import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Container, Row, Col } from "react-bootstrap";
import "./css/StudentDash.css";
import { db } from "../config/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import Cookies from "js-cookie";

const StudentDash = ({ userName }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentYear = async () => {
      try {
        const userId = Cookies.get("userId");
        if (!userId) return;

        const userRef = doc(db, "students", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const studentData = userDoc.data();
          const year = studentData.year;

          if (year) {
            Cookies.set("year", year);
          }
        }
      } catch (error) {
        console.error("Error fetching student year:", error);
      }
    };

    fetchStudentYear();
  }, []);

  return (
    <div className="student-dash-page">
      <Container>
        <h2 className="mb-4 text-center">
          <span className="user-name">{userName}</span>
        </h2>
        <Row className="g-4">
          {[
            { title: "Upload & Store Notes", text: "Store your teaching materials securely in Firestore.", link: "/upload-notes", button: "Upload Notes" },
            { title: "Quiz Generator", text: "Create quizzes automatically from your uploaded notes.", link: "/uploader", button: "Generate Quiz" },
            { title: "Note Maker", text: "Generate crisp notes automatically from your uploaded file.", link: "/notes-generator", button: "Generate Notes" },
            { title: "View Notes", text: "Refer to the notes uploaded by you or your teacher.", link: "/fetch-notes", button: "Access" },
            { title: "Solve Teacher's Quiz", text: "Answer these quizzes approved by the teacher.", link: "/teacher-mcqs", button: "Solve" },
            { title: "Chat with AI", text: "Process PDF and talk with AI.", link: "/pdfchat", button: "Solve" }
          ].map((card, index) => (
            <Col key={index} xs={12} sm={6} md={4}>
              <Card className="shadow-lg card-hover sdcard-hover">
                <Card.Body className="text-center">
                  <Card.Title>{card.title}</Card.Title>
                  <Card.Text>{card.text}</Card.Text>
                  <button onClick={() => navigate(card.link)} className="cust-btn">
                    {card.button}
                  </button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default StudentDash;
