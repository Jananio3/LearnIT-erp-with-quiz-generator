import React, { useState, useEffect } from "react";
import TeacherDash from "./TeacherDash";
import StudentDash from "./StudentDash";
import Cookies from "js-cookie";
import SelectStudent from "./SelectStudent";

function Dashboard({userName}) {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userRole = Cookies.get("role"); // Role is just an identifier, not a collection name
      if (userRole) {
        setRole(userRole)
      }
    };

    fetchUserData();
  }, []);

  return (
    <>
      {role=='teacher'?
        <SelectStudent userName={userName} />
        :
        <StudentDash userName={userName} />
    
      }
    </>
  );
}

export default Dashboard;
