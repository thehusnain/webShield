import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AuthNavbar from "../components/layout/AuthNavbar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { adminAPI } from "../services/api";
import {
  HiUsers,
  HiSearch,
  HiTrash,
  HiEye,
  HiDocumentText,
} from "react-icons/hi";

/* =========================
   TYPES
   ========================= */
interface AdminStats {
  totalUsers: number;
  totalScans: number;
  activeScans: number;
  recentUsers: any[];
  recentScans: any[];
}

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  scanLimit: number;
  scansUsed: number;
}

interface Scan {
  _id: string;
  targetUrl: string;
  scanType: string;
  status: string;
  createdAt: string;
}

/* =========================
   COMPONENT
   ========================= */
export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalScans: 0,
    activeScans: 0,
    recentUsers: [],
    recentScans: [],
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allScans, setAllScans] = useState<Scan[]>([]);

  const usersRef = useRef<HTMLDivElement>(null);
  const scansRef = useRef<HTMLDivElement>(null);

  /* =========================
     ROLE GUARD (CRITICAL FIX)
     ========================= */
  useEffect(() => {
    if (!user) return;

    //  If NOT admin → redirect immediately
    if (user.role !== "admin") {
      console.warn("[AdminDashboard] Non-admin access blocked");
      navigate("/dashboard", { replace: true });
      return;
    }

    // Admin confirmed → load data
    fetchAdminStats();
  }, [user]);

  /* =========================
     HASH NAVIGATION
     ========================= */
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash === "users")
      usersRef.current?.scrollIntoView({ behavior: "smooth" });
    if (hash === "scans")
      scansRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [location]);

  /* =========================
     API CALLS
     ========================= */
  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStats();

      setStats({
        totalUsers: response.totalUsers ?? 0,
        totalScans: response.totalScans ?? 0,
        activeScans: response.activeScans ?? 0,
        recentUsers: response.recentUsers ?? [],
        recentScans: response.recentScans ?? [],
      });

      setAllUsers(response.recentUsers ?? []);
      await fetchAllScans();
    } catch (err: any) {
      setError(err.response?.data?.error || "Admin access denied");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllScans = async () => {
    const response = await adminAPI.getAllHistory();
    setAllScans(response.scans ?? []);
  };

  /* =========================
     FILTERING
     ========================= */
  const filteredUsers = allUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredScans = allScans.filter((s) =>
    s.targetUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* =========================
     LOADING
     ========================= */
  if (loading) {
    return (
      <div className="page-container min-h-screen">
        <AuthNavbar />
        <div className="flex justify-center items-center min-h-[80vh]">
          <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  /* =========================
     ERROR
     ========================= */
  if (error) {
    return (
      <div className="page-container min-h-screen">
        <AuthNavbar />
        <div className="flex justify-center items-center min-h-[80vh]">
          <Card>
            <p className="text-red-500">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  /* =========================
     RENDER
     ========================= */
  return (
    <div className="page-container min-h-screen">
      <AuthNavbar />

      <div className="content-wrapper py-8">
        <h1 className="text-4xl font-bold mb-6">
          <span className="text-gradient">Admin Dashboard</span>
        </h1>

        {/* SEARCH */}
        <Card className="mb-6">
          <Input
            placeholder="Search users or scans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<HiSearch />}
          />
        </Card>

        {/* USERS */}
        <div ref={usersRef}>
          <h2 className="text-2xl font-bold mb-4">
            <HiUsers className="inline mr-2" /> Users
          </h2>

          {filteredUsers.map((u) => (
            <Card
              key={u._id}
              className="mb-3 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{u.username}</p>
                <p className="text-sm text-gray-500">{u.email}</p>
              </div>
              <Button>
                <HiEye className="mr-1" /> View
              </Button>
            </Card>
          ))}
        </div>

        {/* SCANS */}
        <div ref={scansRef} className="mt-10">
          <h2 className="text-2xl font-bold mb-4">
            <HiDocumentText className="inline mr-2" /> Scans
          </h2>

          {filteredScans.map((scan) => (
            <Card key={scan._id} className="mb-3">
              <p className="font-semibold">{scan.targetUrl}</p>
              <p className="text-sm text-gray-500">{scan.scanType}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
