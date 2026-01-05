import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "../pages/public/Landing";
import Login from "../pages/public/Login";
import Signup from "../pages/public/Signup";
import Disclaimer from "../pages/public/Disclaimer";
import Dashboard from "../pages/user/Dashboard";
import Profile from "../pages/user/Profile";
import ForgotPassword from "../pages/public/ForgotPassword";
import ResetPassword from "../pages/public/ResetPassword";
import ScanHistory from "../pages/user/ScanHistory";
import ScanProgress from "../pages/user/ScanProgress";
import ScanResult from "../pages/user/ScanResult";
import ProtectedRoute from "../components/common/ProtectedRoute";
import StartScan from "../pages/user/StartScan";
import AboutTools from "../pages/user/AboutTools";
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute requireAuth={false}>
              <Landing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <ProtectedRoute requireAuth={false}>
              <Signup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ProtectedRoute requireAuth={false}>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute requireAuth={false}>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/disclaimer"
          element={
            <ProtectedRoute>
              <Disclaimer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/start-scan" element={<StartScan />} />
        <Route
  path="/scan-progress/:scanId"
  element={
    <ProtectedRoute>
      <ScanProgress />
    </ProtectedRoute>
  }
/>
<Route
  path="/scan-result/:scanId"
  element={
    <ProtectedRoute>
      <ScanResult />
    </ProtectedRoute>
  }
/>
<Route
  path="/scan-history"
  element={
    <ProtectedRoute>
      <ScanHistory />
    </ProtectedRoute>
  }
/>

<Route path="/about-tools" element={<AboutTools />} />
        {/* TODO: add scan pages and admin pages later */}
      </Routes>
    </BrowserRouter>
  );
}


export default AppRoutes;