import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Container, Row, Col } from "react-bootstrap";
import "./css/TeacherDash.css"; // Ensures consistency
import Cookies from "js-cookie";

const TeacherDash = ({ userName }) => {
  const navigate = useNavigate();
  const params = useParams();
  const subject = params.subject;
  const year = params.year;

  useEffect(()=>{
    Cookies.set("subject",subject);
    Cookies.set("year",year);
  },[subject,year])

  const teacherOptions = [
    {
      title: "Upload & Store Notes",
      text: "Store your teaching materials securely in Firestore.",
      link: "/upload-notes",
      button: "Upload Notes",
    },
    {
      title: "Quiz Generator",
      text: "Create quizzes automatically from your uploaded notes.",
      link: "/uploader",
      button: "Generate Quiz",
    },
    {
      title: "Note Maker",
      text: "Generate crisp notes automatically from your uploaded file.",
      link: "/notes-generator",
      button: "Generate Notes",
    },
    {
      title: "My Students",
      text: "View your students.",
      link: "/my-students",
      button: "View",
    },
    {
      title: "View Uploaded Quizzes",
      text: "See the quizzes you uploaded.",
      link: "/teacher-quizzes",
      button: "View",
    },
    {
      title: "View Uploaded Notes",
      text: "Check the notes you uploaded.",
      link: "/teacher-uploads",
      button: "View",
    },
  ];

  return (
    <div className="teacher-dash-page">
      <Container>
        <h2 className="mb-4 text-center">
          <span className="user-name">{userName}</span>
        </h2>
        <Row className="g-4">
          {teacherOptions.map((card, index) => (
            <Col key={index} xs={12} sm={6} md={4}>
              <Card className="shadow-lg card-hover sdcard-hover">
                <Card.Body className="text-center">
                  <Card.Title>{card.title}</Card.Title>
                  <Card.Text>{card.text}</Card.Text>
                  <button
                    onClick={() =>
                      navigate(card.link, { state: { subject, year } })
                    }
                    className="cust-btn"
                  >
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

export default TeacherDash;
