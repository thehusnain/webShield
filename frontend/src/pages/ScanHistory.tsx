import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { scanAPI } from '../services/api';
import AuthNavbar from '../components/layout/AuthNavbar';
import Card from '../components/common/Card';
import { HiCheckCircle, HiClock, HiXCircle } from 'react-icons/hi';

interface Scan {
  _id: string;
  targetUrl: string;
  scanType: string;
  status: string;
  createdAt: string;
}

export default function ScanHistory() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'running' | 'failed'>('all');

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const response = await scanAPI.getHistory();
      setScans(response.scans || []);
    } catch (error) {
      console.error('Failed to fetch scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <HiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'running':
      case 'pending':
        return <HiClock className="w-5 h-5 text-yellow-500 animate-pulse" />;
      case 'failed':
        return <HiXCircle className="w-5 h-5 text-red-500" />;
      default:
        return <HiClock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'running':
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const filteredScans = scans.filter(scan => {
    if (filter === 'all') return true;
    if (filter === 'running') return scan.status === 'running' || scan.status === 'pending';
    return scan.status === filter;
  });

  return (
    <div className="page-container min-h-screen">
      <AuthNavbar />

      <div className="content-wrapper py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">
            <span className="text-gradient">Scan History</span>
          </h1>
          <Link to="/scan/start">
            <button className="btn-primary">New Scan</button>
          </Link>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-primary text-black'
                : 'bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'completed'
                ? 'bg-primary text-black'
                : 'bg-light-card dark: bg-dark-card border border-light-border dark:border-dark-border'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('running')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'running'
                ? 'bg-primary text-black'
                : 'bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border'
            }`}
          >
            Running
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'failed'
                ? 'bg-primary text-black'
                : 'bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border'
            }`}
          >
            Failed
          </button>
        </div>

        {/* Scans list */}
        {loading ? (
          <Card>
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading scans...</p>
            </div>
          </Card>
        ) : filteredScans.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filter === 'all' ? 'No scans yet' : `No ${filter} scans`}
              </p>
              <Link to="/scan/start">
                <button className="btn-primary">Start First Scan</button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredScans.map(scan => (
              <Link
                key={scan._id}
                to={scan.status === 'completed' ? `/scan/${scan._id}/results` : `/scan/${scan._id}`}
              >
                <Card hover>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {getStatusIcon(scan.status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{scan.targetUrl}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="uppercase font-medium">{scan.scanType}</span>
                          <span>•</span>
                          <span>{new Date(scan.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-semibold uppercase text-sm ${getStatusColor(scan.status)}`}
                      >
                        {scan.status}
                      </span>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
