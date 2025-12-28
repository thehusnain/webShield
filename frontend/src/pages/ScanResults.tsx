import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scanAPI } from '../services/api';
import AuthNavbar from '../components/layout/AuthNavbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { HiDownload, HiArrowLeft } from 'react-icons/hi';

interface ScanData {
  _id: string;
  targetUrl: string;
  scanType: string;
  status: string;
  results: any;
  createdAt: string;
  reportContent?: string;
}

export default function ScanResults() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);

  // 🔥 FIX: Use useCallback to memoize the function
  const fetchScanResults = useCallback(async () => {
    if (!scanId || scanId === 'undefined') {
      console.error('[ScanResults] Invalid scanId');
      navigate('/dashboard', { replace: true });
      return;
    }

    try {
      console.log('[ScanResults] Fetching scan results:', scanId);
      const response = await scanAPI.getScan(scanId);
      console.log('[ScanResults] Results received:', response.scan);
      setScan(response.scan);
      setLoading(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      console.error('[ScanResults] Error:', error);
      setError(error.response?.data?.error || 'Failed to load results');
      setLoading(false);
    }
  }, [scanId, navigate]); // 🔥 Added dependencies

  // 🔥 FIX: Added fetchScanResults to dependency array
  useEffect(() => {
    fetchScanResults();
  }, [fetchScanResults]);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      console.log('[ScanResults] Generating report for:', scanId);
      await scanAPI.generateReport(scanId!);
      alert('Report generated successfully!');
      await fetchScanResults(); // Refresh to get report content
    } catch (err) {
      console.error('[ScanResults] Generate report error:', err);
      alert('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadReport = () => {
    console.log('[ScanResults] Downloading report for:', scanId);
    scanAPI.downloadReport(scanId!);
  };

  const getScanTypeInfo = (type: string) => {
    const types: Record<string, { name: string; icon: string; color: string }> = {
      nmap: { name: 'Nmap', icon: '🔍', color: 'bg-blue-500' },
      nikto: { name: 'Nikto', icon: '🌐', color: 'bg-red-500' },
      ssl: { name: 'SSL/TLS', icon: '🔒', color: 'bg-green-500' },
      sqlmap: { name: 'SQLMap', icon: '💉', color: 'bg-yellow-500' },
    };
    return types[type] || { name: type, icon: '📋', color: 'bg-gray-500' };
  };

  const renderResults = () => {
    if (!scan || !scan.results) return null;

    const result = scan.results[scan.scanType];
    if (!result) return <p>No results available</p>;

    const scanTypeInfo = getScanTypeInfo(scan.scanType);

    return (
      <div className="space-y-6">
        {/* Summary Card */}
        <Card className={`${scanTypeInfo.color} bg-opacity-10`}>
          <div className="flex items-center gap-4">
            <div className="text-5xl">{scanTypeInfo.icon}</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{scanTypeInfo.name} Scan Results</h2>
              <p className="text-gray-600 dark:text-gray-400">{scan.targetUrl}</p>
            </div>
          </div>
          {result.summary && (
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="font-medium">{result.summary}</p>
            </div>
          )}
        </Card>

        {/* Nmap Results */}
        {scan.scanType === 'nmap' && result.openPorts && (
          <Card>
            <h3 className="text-xl font-bold mb-4">Open Ports ({result.totalPorts || 0})</h3>
            {result.openPorts.length > 0 ? (
              <div className="space-y-2">
                {result.openPorts.map((port: string, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm"
                  >
                    {port}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No open ports detected</p>
            )}
          </Card>
        )}

        {/* Nikto Results */}
        {scan.scanType === 'nikto' && result.findings && (
          <Card>
            <h3 className="text-xl font-bold mb-4">Findings ({result.totalFindings || 0})</h3>
            {result.findings.length > 0 ? (
              <div className="space-y-2">
                {result.findings.map((finding: string, index: number) => (
                  <div key={index} className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                    {finding}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No vulnerabilities detected</p>
            )}
          </Card>
        )}

        {/* SSL Results */}
        {scan.scanType === 'ssl' && result.issues && (
          <Card>
            <h3 className="text-xl font-bold mb-4">
              SSL/TLS Analysis
              <span className="ml-2 text-sm font-normal">
                ({result.criticalIssues || 0} critical, {result.warnings || 0} warnings,{' '}
                {result.passed || 0} passed)
              </span>
            </h3>
            {result.issues.length > 0 ? (
              <div className="space-y-2">
                {result.issues.map((issue: string, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded text-sm ${
                      issue.includes('❌')
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                        : issue.includes('⚠️')
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                        : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    }`}
                  >
                    {issue}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No SSL/TLS information available</p>
            )}
          </Card>
        )}

        {/* SQLMap Results */}
        {scan.scanType === 'sqlmap' && (
          <Card>
            <h3 className="text-xl font-bold mb-4">SQL Injection Analysis</h3>
            <div
              className={`p-4 rounded-lg mb-4 ${
                result.vulnerable
                  ? 'bg-red-100 dark:bg-red-900/20 border-2 border-red-500'
                  : 'bg-green-100 dark:bg-green-900/20 border-2 border-green-500'
              }`}
            >
              <p className="font-bold text-lg">
                {result.vulnerable ? '⚠️ VULNERABLE TO SQL INJECTION' : '✅ NOT VULNERABLE'}
              </p>
            </div>

            {result.vulnerabilities && result.vulnerabilities.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold mb-2">Vulnerabilities: </h4>
                {result.vulnerabilities.map((vuln: string, index: number) => (
                  <div key={index} className="p-3 bg-red-50 dark:bg-red-900/10 rounded text-sm">
                    {vuln}
                  </div>
                ))}
              </div>
            )}

            {result.warnings && result.warnings.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold mb-2">Warnings:</h4>
                {result.warnings.map((warning: string, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-yellow-50 dark: bg-yellow-900/10 rounded text-sm"
                  >
                    {warning}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Raw Output */}
        {result.rawOutput && (
          <Card>
            <h3 className="text-xl font-bold mb-4">Raw Output</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs whitespace-pre-wrap font-mono">{result.rawOutput}</pre>
            </div>
          </Card>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="page-container min-h-screen">
        <AuthNavbar />
        <div className="content-wrapper flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container min-h-screen">
        <AuthNavbar />
        <div className="content-wrapper flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="page-container min-h-screen">
        <AuthNavbar />
        <div className="content-wrapper flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Scan Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The scan results you're looking for don't exist
            </p>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container min-h-screen">
      <AuthNavbar />

      <div className="content-wrapper py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-4xl font-bold">
            <span className="text-gradient">Scan Results</span>
          </h1>

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              <HiArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Button>

            <Button
              onClick={handleGenerateReport}
              isLoading={generatingReport}
              disabled={generatingReport}
            >
              📄 Generate Report
            </Button>

            {scan.reportContent && (
              <Button variant="primary" onClick={handleDownloadReport}>
                <HiDownload className="w-5 h-5" />
                Download Report
              </Button>
            )}
          </div>
        </div>

        {renderResults()}

        {/* Scan Metadata */}
        <Card className="mt-6">
          <h3 className="text-xl font-bold mb-4">Scan Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scan ID</p>
              <p className="font-mono text-sm">{scan._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scan Type</p>
              <p className="font-semibold uppercase">{scan.scanType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Target URL</p>
              <p className="font-medium">{scan.targetUrl}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scan Date</p>
              <p>{new Date(scan.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <p className="font-semibold uppercase text-green-500">{scan.status}</p>
            </div>
            {scan.reportContent && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Report Status</p>
                <p className="font-semibold text-green-500">✅ Generated</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
