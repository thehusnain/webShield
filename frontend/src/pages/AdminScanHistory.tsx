import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthNavbar from '../components/layout/AuthNavbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { adminAPI } from '../services/api';

export default function AdminScanHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetchAllScans();
  }, [user, navigate]);

  const fetchAllScans = async () => {
    try {
      const response = await adminAPI.getAllHistory();
      setScans(response.scans || []);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load scan history');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveScan = async (scanId: string) => {
    if (!window.confirm('Are you sure you want to delete this scan?')) {
      return;
    }

    try {
      await adminAPI.removeScan(scanId);
      alert('Scan removed successfully');
      fetchAllScans();
    } catch (error: any) {
      alert('Failed to remove scan: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return (
      <div className="page-container min-h-screen">
        <AuthNavbar />
        <div className="content-wrapper flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading scan history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container min-h-screen">
      <AuthNavbar />

      <div className="content-wrapper py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">
            <span className="text-gradient">All Scan History</span>
          </h1>
          <Button onClick={() => navigate('/admin')}>Back to Admin Dashboard</Button>
        </div>

        {error && (
          <Card className="mb-6 bg-red-500/10 border-red-500/50">
            <p className="text-red-500">{error}</p>
          </Card>
        )}

        <div className="space-y-4">
          {scans.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No scans found</p>
              </div>
            </Card>
          ) : (
            scans.map(scan => (
              <Card key={scan._id}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{scan.targetUrl}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {scan.scanType.toUpperCase()} •{' '}
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </p>
                    {scan.userId && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        User: {scan.userId.username} ({scan.userId.email})
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        scan.status === 'completed'
                          ? 'bg-green-500/20 text-green-500'
                          : scan.status === 'running'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {scan.status}
                    </span>
                    <Button size="sm" variant="danger" onClick={() => handleRemoveScan(scan._id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
