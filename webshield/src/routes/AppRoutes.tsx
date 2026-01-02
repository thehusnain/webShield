import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "../pages/public/Landing";
import Login from "../pages/public/Login";
import Signup from "../pages/public/Signup";
import Disclaimer from "../pages/public/Disclaimer";
import Dashboard from "../pages/user/Dashboard";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/logout" />
        <Route path="/profile" />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
