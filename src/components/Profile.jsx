import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { db } from "../config/firebase-config"; // Ensure you have Firebase configured
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore"; // Firebase Firestore methods
import {
  getAuth,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth"; // Firebase Authentication methods
import "./css/Profile.css"; // Custom CSS for additional styling
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null); // Initial state is null instead of an array
  const [loading, setLoading] = useState(true); // To show loading state while fetching data
  const [error, setError] = useState(""); // To handle errors
  const [newPassword, setNewPassword] = useState(""); // State for new password input
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(""); // Success message for password change
  const [deleteConfirmation, setDeleteConfirmation] = useState(false); // Confirmation for deleting account
  const [oldPass, setOldPass] = useState("");
  const navigate = useNavigate();
  const role = Cookies.get('role')

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = Cookies.get("userId"); // Get the userId from cookies

      if (!userId) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, role + "s", userId); // Reference to user document in Firestore
        const userDoc = await getDoc(userRef); // Fetch the user document

        if (userDoc.exists()) {
          setUser(userDoc.data()); // Set user data from Firestore
        } else {
          setError("User not found.");
        }
      } catch (err) {
        setError(`Error fetching user: ${err.message}`);
      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    };

    fetchUserData();
  }, []);

  const handlePasswordChange = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        oldPass
      ); 
      await reauthenticateWithCredential(user, credential); 

      await updatePassword(user, newPassword); 
      setPasswordChangeSuccess("Password updated successfully.");
    } catch (err) {
      setError(`Error updating password: ${err.message}`);
    }
  };

  const handleAccountDeletion = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    const userId = Cookies.get('userId');

    if (deleteConfirmation) {
      try {
        await deleteUser(user); 
        const userRef = doc(db, role === 'student' ? "students" : "teachers", userId);
        await deleteDoc(userRef);
        setError("Account deleted successfully.");
        Cookies.remove('role');
        Cookies.remove('isLogin');
        Cookies.remove('userId');
        
      } catch (err) {
        setError(`Error deleting account: ${err.message}`);
      }
    } else {
      setDeleteConfirmation(true);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>; // Show loading while fetching data
  }

  if (error) {
    return <div className="error">{error}</div>; // Show error message if any
  }

  if (!user) {
    return <div className="no-data">No user data found.</div>; // Fallback if no user data
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h2>{user.name}</h2>
          <p className="role">
            {role=== "student" ? "Student" : "Teacher"}
            <p>{user.email}</p>
          </p>
        </div>

        <div className="profile-info">
          {user.role === "teacher" && (
            <p>
              <strong>Subject:</strong> {user.subject}
            </p>
          )}
        </div>

        {/* Change Password */}
        <div className="password-change-section">
          <h4>Change Password</h4>
          <input
            type="password"
            placeholder="Current Password"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button className="btn-primary" onClick={handlePasswordChange}>
            Change Password
          </button>
          {passwordChangeSuccess && (
            <p className="success-message">{passwordChangeSuccess}</p>
          )}
        </div>

        {/* Account Deletion */}
        <div className="account-deletion-section">
          <h4>Delete Account</h4>
          {deleteConfirmation ? (
            <div className="confirmation">
              <p>
                Are you sure you want to delete your account? This action cannot
                be undone.
              </p>
              <button className="btn-danger" onClick={handleAccountDeletion}>
                Yes, Delete My Account
              </button>
              <button
                className="btn-cancel"
                onClick={() => setDeleteConfirmation(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button className="btn-danger" onClick={handleAccountDeletion}>
              Delete Account
            </button>
          )}
        </div>

        {role === "student" && (
          <div className="my-stats-link d-flex" style={{justifyContent:'center',fontSize:20}}>
            <Link to="/my-stats" style={{textDecoration:'none'}}>
              My Stats
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
