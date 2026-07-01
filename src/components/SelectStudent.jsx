import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../config/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Container, Row, Col } from "react-bootstrap";
import "./css/TeacherDash.css";
import Cookies from "js-cookie";

const SelectStudent = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  useEffect(()=>{
    setUserId(Cookies.get('userId'));
    if (Cookies.get("subject")) {
      Cookies.remove("subject");
      Cookies.remove("year");
    }
  },[])



  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const teacherDoc = await getDoc(doc(db, "teachers", userId));
        if (teacherDoc.exists()) {
          const teacherData = teacherDoc.data();
          setSubjects(teacherData.subjects)
        }
      } catch (error) {
        console.error("Error fetching teacher data: ", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacherData();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="teacher-dash-page">
      <Container>
        <h2 className="mb-4 text-center">
          Choose the Subject and Year to Proceed
        </h2>
        <Row className="g-4">
          {subjects.map((subject, index) => (
            <Col key={index} xs={12} sm={6} md={4}>
              <Card className="shadow-lg card-hover sdcard-hover">
                <Card.Body className="text-center">
                  <Card.Title>{subject.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{subject.year}</Card.Subtitle>
                  <button
                    onClick={() => navigate(`/teacher/${subject.name}/${subject.year}`)}
                    className="cust-btn"
                  >
                    Manage {subject.name}
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

export default SelectStudent;
