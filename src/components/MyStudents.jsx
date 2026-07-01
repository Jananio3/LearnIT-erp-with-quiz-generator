import React, { useState, useEffect } from "react";
import { db } from "../config/firebase-config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import Cookies from "js-cookie";
import { Container, Card, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./css/MyStudents.css";

function MyStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const userId = Cookies.get("userId");

        if (!userId) {
          setError("User authentication failed. Please log in.");
          setLoading(false);
          return;
        }

        const teacherRef = doc(db, "teachers", userId);
        const teacherDoc = await getDoc(teacherRef);

        if (!teacherDoc.exists()) {
          setError("Teacher not found.");
          setLoading(false);
          return;
        }

        const teacherData = teacherDoc.data();
        const subjectYears = (teacherData.subjects || [])
          .map((sub) => sub.year)
          .filter((year) => typeof year === "string" && year.trim() !== "");

        if (subjectYears.length === 0) {
          setError("No valid subject years found for this teacher.");
          setLoading(false);
          return;
        }

        // 🔥 Final Firestore query (no organization filtering)
        const studentsQuery = query(
          collection(db, "students"),
          where("year", "in", subjectYears)
        );

        const studentsSnapshot = await getDocs(studentsQuery);

        if (studentsSnapshot.empty) {
          setError("No students found matching the criteria.");
        } else {
          const studentsList = studentsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setStudents(studentsList);
        }
      } catch (err) {
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <Container className="py-5 bodycont">
      <h2 className="text-center mb-4">My Students</h2>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}

      <div className="d-flex flex-wrap justify-content-center">
        {students.map((student) => (
          <Card key={student.id} className="m-3 p-3 shadow-lg">
            <Card.Body className="text-center">
              <Card.Title>{student.name}</Card.Title>
              <Card.Text>Email: {student.email}</Card.Text>
              <Card.Text>Organization: {student.organization}</Card.Text>
              <Link to={`/my-students/${student.id}`} className="cust-btn">
                View Stats
              </Link>
            </Card.Body>
          </Card>
        ))}
      </div>
    </Container>
  );
}

export default MyStudents;
