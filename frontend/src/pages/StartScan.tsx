import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { scanAPI } from '../services/api';
import { validateURL } from '../utils/validation';
import AuthNavbar from '../components/layout/AuthNavbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function StartScan() {
  const navigate = useNavigate();
  const [targetUrl, setTargetUrl] = useState('');
  const [scanType, setScanType] = useState<'nmap' | 'nikto' | 'ssl' | 'sqlmap'>('nikto');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const scanTypes = [
    { id: 'nikto', name: 'Nikto', description: 'Web server scanner', icon: '🌐', time: '2-3 min' },
    { id: 'nmap', name: 'Nmap', description: 'Port scanner', icon: '🔍', time: '1-2 min' },
    { id: 'ssl', name: 'SSL/TLS', description: 'SSL scanner', icon: '🔒', time: '1 min' },
    { id: 'sqlmap', name: 'SQLMap', description: 'SQL injection', icon: '💉', time: '3-5 min' },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateURL(targetUrl)) {
      setError('Please enter a valid URL (must include http:// or https://)');
      return;
    }

    setLoading(true);

    try {
      console.log('[StartScan] Submitting scan:', { targetUrl, scanType });
      console.log('[StartScan] Cookies before request:', document.cookie);

      const response = await scanAPI.startScan({ targetUrl, scanType });

      console.log('[StartScan] Full response:', response);

      // Extract scanId from various possible locations
      const scanId =
        response.scanId || response.scan?._id || response.scan?.id || response.data?.scanId;

      console.log('[StartScan] Extracted scanId:', scanId);

      if (!scanId) {
        console.error('[StartScan] No scanId found in response:', response);
        throw new Error('Server did not return a scan ID');
      }

      console.log('[StartScan] ✅ Scan created successfully, ID:', scanId);
      console.log('[StartScan] Cookies after response:', document.cookie);
      console.log('[StartScan] About to navigate to:', `/scan/${scanId}`);

      // Small delay to ensure everything is set
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('[StartScan] Navigating now...');

      // Navigate to progress page
      navigate(`/scan/${scanId}`, { replace: false });

      console.log('[StartScan] Navigation completed');
    } catch (err: unknown) {
      const error = err as {
        response?: {
          status?: number;
          data?: { error?: string };
        };
        message?: string;
      };

      console.error('[StartScan] ❌ Error:', error);

      setLoading(false);

      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        // Don't auto-navigate - let user decide
      } else if (error.response?.status === 403) {
        setError(error.response?.data?.error || 'You have reached your scan limit.');
      } else if (error.response?.status === 409) {
        setError(error.response?.data?.error || 'A scan is already running.');
      } else {
        setError(error.response?.data?.error || error.message || 'Failed to start scan');
      }
    }
  };

  return (
    <div className="page-container min-h-screen">
      <AuthNavbar />

      <div className="content-wrapper py-8">
        <h1 className="text-4xl font-bold mb-6">
          <span className="text-gradient">Start Security Scan</span>
        </h1>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Target URL"
              type="url"
              value={targetUrl}
              onChange={e => setTargetUrl(e.target.value)}
              placeholder="https://example.com"
              required
              disabled={loading}
            />

            <div>
              <label className="block text-sm font-medium mb-3">Select Scan Type</label>
              <div className="grid md:grid-cols-2 gap-4">
                {scanTypes.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setScanType(type.id as typeof scanType)}
                    disabled={loading}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      scanType === type.id
                        ? 'border-primary bg-primary/10'
                        : 'border-light-border dark:border-dark-border hover:border-primary/50'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{type.icon}</span>
                      <div>
                        <div className="font-semibold text-lg">{type.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {type.description}
                        </div>
                        <div className="text-xs text-primary">⏱️ {type.time}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {loading && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-blue-500">Starting scan... Please wait</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Starting Scan...' : 'Start Scan'}
            </Button>
          </form>
        </Card>

        <Card className="mt-6 bg-blue-500/10 border-blue-500/50">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="font-bold text-blue-500 mb-1">Important Notice</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Only scan websites you own or have explicit permission to test. Unauthorized
                scanning may be illegal in your jurisdiction.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
