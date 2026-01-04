// 1. IMPORT STATEMENTS - Bring in the tools we need
import { useState, useEffect } from "react"; // React hooks for state and side effects
import { useNavigate } from "react-router-dom"; // For navigating between pages
import { useAuth } from "../../context/AuthContext"; // Access user data and logout function
import { Profile as getProfile } from "../../api/auth-api"; // API call (renamed to avoid naming conflict)
import "../../styles/profile.css"; // CSS styles for this page

// CREATE THE PROFILE COMPONENT
const Profile = () => {
  // INITIALIZE HOOKS - Set up navigation and authentication
  const navigate = useNavigate(); // Hook to navigate to different pages
  const { user, logout } = useAuth(); // Get current user data and logout function from context

  // STATE MANAGEMENT - Create variables that can change and trigger UI updates
  const [userData, setUserData] = useState(user); // Store user data, start with data from context
  const [loading, setLoading] = useState(false); // Track if data is loading (show spinner)

  // SIDE EFFECT - Run code when component loads
  useEffect(() => {
    fetchProfile(); // Call function to get user data when page opens
  }, []); // Empty array means "run only once"

  // FUNCTION TO FETCH USER DATA FROM BACKEND
  const fetchProfile = async () => {
    try {
      setLoading(true); // Show loading state
      const response = await getProfile(); // Call your API function
      if (response.data.success) {
        setUserData(response.data.user); // Save user data to state
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  // LOGOUT FUNCTION
  const handleLogout = () => {
    logout(); // Call logout from AuthContext
    navigate("/"); // Redirect to home page
  };

  // LOADING STATE - Show spinner while data is loading
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loader"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  // MAIN UI RENDER 
  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* USER PROFILE HEADER WITH AVATAR */}
        <div className="profile-header">
          <div className="profile-avatar">
            {/* Show first letter of username in big circle */}
            {userData?.username?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-gradient">{userData?.username}</h2>
          <p className="user-email">{userData?.email}</p>
        </div>

        {/* USER INFORMATION SECTION */}
        <div className="profile-info">
          {/* USER ID */}
          <div className="info-item">
            <span className="info-label">User ID:</span>
            <span className="info-value">{userData?.userId}</span>
          </div>

          {/* ACCOUNT TYPE (User/Admin) */}
          <div className="info-item">
            <span className="info-label">Account Type:</span>
            <span className="info-value role-badge">
              {userData?.role?.toUpperCase()}
            </span>
          </div>

          {/* SCAN USAGE (How many scans used vs limit) */}
          <div className="info-item">
            <span className="info-label">Scan Usage:</span>
            <span className="info-value">
              {userData?.usedScan || 0} / {userData?.scanLimit || 10}
              <span className="usage-percentage">
                (
                {userData
                  ? Math.round((userData.usedScan / userData.scanLimit) * 100)
                  : 0}
                % used)
              </span>
            </span>
          </div>

          {/* MEMBER SINCE DATE */}
          <div className="info-item">
            <span className="info-label">Member Since:</span>
            <span className="info-value">
              {userData?.createdAt
                ? new Date(userData.createdAt).toLocaleDateString()
                : "N/A"}
            </span>
          </div>

          {/* TERMS ACCEPTED STATUS */}
          <div className="info-item">
            <span className="info-label">Terms Accepted:</span>
            <span
              className={`info-value ${
                userData?.agreedToTerms ? "terms-yes" : "terms-no"
              }`}
            >
              {userData?.agreedToTerms ? "Yes" : "No"}
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="profile-actions">
          <button onClick={() => navigate("/dashboard")} className="btn-back">
            ← Back to Dashboard
          </button>
          <button
            onClick={() => navigate("/scan-history")}
            className="btn-history"
          >
            View Scan History
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
