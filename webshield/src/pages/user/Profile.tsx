import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Profile as getProfile } from "../../api/auth-api";
import "../../styles/profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [userData, setUserData] = useState(user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const respone = getProfile();
      if (respone.data.success) {
        setUserData(respone.data.user);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loader"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Main Profile Card */}
      <div className="profile-card">
        {/* Header with user avatar */}
        <div className="profile-header">
          <div className="profile-avatar">
            {/* Show first letter of username */}
            {userData?.username?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-gradient">{userData?.username}</h2>
          <p className="user-email">{userData?.email}</p>
        </div>

        {/* User Information Section */}
        <div className="profile-info">
          {/* User ID */}
          <div className="info-item">
            <span className="info-label">User ID:</span>
            <span className="info-value">{userData?.userId}</span>
          </div>

          {/* Account Type */}
          <div className="info-item">
            <span className="info-label">Account Type:</span>
            <span className="info-value role-badge">
              {userData?.role?.toUpperCase()}
            </span>
          </div>

          {/* Scan Usage */}
          <div className="info-item">
            <span className="info-label">Scan Usage:</span>
            <span className="info-value">
              {userData?.usedScan || 0} / {userData?.scanLimit || 15}
              <span className="usage-percentage">
                (
                {userData
                  ? Math.round((userData.usedScan / userData.scanLimit) * 100)
                  : 0}
                % used)
              </span>
            </span>
          </div>

          {/* Member Since */}
          <div className="info-item">
            <span className="info-label">Member Since:</span>
            <span className="info-value">
              {userData?.createdAt
                ? new Date(userData.createdAt).toLocaleDateString()
                : "N/A"}
            </span>
          </div>

          {/* Terms Accepted Status */}
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

        {/* Action Buttons */}
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
