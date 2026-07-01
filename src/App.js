import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Dashboard from "./components/Dashboard";
import Landing from "./components/Landing";
import Footer from "./components/Footer";
import Register from "./components/Register";
import Login from "./components/Login";
import { useState } from "react";
import UploadNotes from "./components/UploadNotes";
import FetchUploads from "./components/FetchUploads";
import TeacherDash from "./components/TeacherDash";
import Uploader from "./components/Uploader";
import QuizStructure from "./components/QuizStructure";
import NoteGenerator from "./components/NoteGenerator";
import MyStudents from "./components/MyStudents";
import ViewTeacherNotes from "./components/ViewTeacherNotes";
import ViewQuizzes from "./components/ViewQuizzes";
import QuizStudents from "./components/QuizStudents";
import Profile from "./components/Profile";
import TeacherMcq from "./components/TeacherMcq";
import PDFChat from "./components/PDFChat";
import MyStats from "./components/MyStats";
import StudentDetails from "./components/StudentDetails";

function App() {
  const [questions, setQuestions] = useState([]);
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  return (
    <Router>
      <Nav isLogin={isLogin} setIsLogin={setIsLogin} />
      {isLogin ? (
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload-notes" element={<UploadNotes />} />
          <Route path="/fetch-notes" element={<FetchUploads />} />
          <Route path="/teacher/:subject/:year" element={<TeacherDash />} />
          <Route path="/uploader" element={ <Uploader questions={questions} setQuestions={setQuestions} />}/>
          <Route path="/quiz/:quizId?" element={ <QuizStructure setQuestions={setQuestions} questions={questions} />}/>
          <Route path="/notes-generator" element={<NoteGenerator />} />
          <Route path="/my-students" element={<MyStudents />} />
          <Route path="/my-students/:studentId" element={<StudentDetails />} />
          <Route path="/teacher-uploads" element={<ViewTeacherNotes />} />
          <Route path="/teacher-quizzes" element={<ViewQuizzes setQuestions={setQuestions} />} />
          <Route path="/student-quiz-details/:quizId" element={<QuizStudents />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/fetch-notes" element={<FetchUploads />} />
          <Route path="/teacher-mcqs" element={<TeacherMcq setQuestions={setQuestions} />} />
          <Route path="/pdfchat" element={<PDFChat />} />
          <Route path="/my-stats" element={<MyStats />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/login"
            element={
              <Login setIsLogin={setIsLogin} setUserName={setUsername} />
            }
          />
        </Routes>
      )}
      <Footer />
    </Router>
  );
}

export default App;
