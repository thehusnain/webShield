import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { scanAPI } from "../services/api";
import AuthNavbar from "../components/layout/AuthNavbar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { HiArrowLeft, HiDownload, HiDocumentText } from "react-icons/hi";
import type { Scan } from "../types";

export default function ScanResults() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();

  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    if (scanId) {
      fetchScanResults();
    }
  }, [scanId]);

  const fetchScanResults = async () => {
    try {
      setLoading(true);
      const response = await scanAPI.getScan(scanId!);
      setScan(response.scan);
    } catch (err: any) {
      console.error("Failed to fetch scan:", err);
      setError(err.response?.data?.error || "Failed to load scan results");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      await scanAPI.generateReport(scanId!);
      await fetchScanResults();
      alert("Report generated successfully!");
    } catch (err) {
      console.error("Failed to generate report:", err);
      alert("Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadReport = () => {
    scanAPI.downloadReport(scanId!);
  };

  if (loading) {
    return (
      <div className="page-container min-h-screen">
        <AuthNavbar />
        <div className="flex justify-center items-center min-h-[80vh]">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="page-container min-h-screen">
        <AuthNavbar />
        <div className="content-wrapper py-8">
          <Card className="p-8 text-center">
            <p className="text-red-500 mb-4">{error || "Scan not found"}</p>
            <Button onClick={() => navigate("/history")}>
              Back to History
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container min-h-screen">
      <AuthNavbar />

      <div className="content-wrapper py-8 px-4 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <Button
            onClick={() => navigate("/history")}
            variant="secondary"
            className="mb-4 flex items-center gap-2"
          >
            <HiArrowLeft /> Back to History
          </Button>

          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient">Scan Results</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{scan.targetUrl}</p>
        </div>

        {/* SCAN INFO CARD */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md: grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Scan Type
              </p>
              <p className="font-semibold uppercase">{scan.scanType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Status
              </p>
              <p
                className={`font-semibold ${
                  scan.status === "completed"
                    ? "text-green-500"
                    : scan.status === "failed"
                    ? "text-red-500"
                    : "text-yellow-500"
                }`}
              >
                {scan.status.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Started
              </p>
              <p className="font-semibold">
                {new Date(scan.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Completed
              </p>
              <p className="font-semibold">
                {scan.completedAt
                  ? new Date(scan.completedAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </Card>

        {/* REPORT ACTIONS */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Generate Report</h3>
          <div className="flex gap-4">
            {!scan.reportContent ? (
              <Button
                onClick={handleGenerateReport}
                isLoading={generatingReport}
                variant="primary"
                className="flex items-center gap-2"
              >
                <HiDocumentText />
                {generatingReport ? "Generating..." : "Generate AI Report"}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleDownloadReport}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <HiDownload />
                  Download Report
                </Button>
                <Button
                  onClick={handleGenerateReport}
                  isLoading={generatingReport}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <HiDocumentText />
                  Regenerate Report
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* SCAN RESULTS */}
        <div className="space-y-8">
          {/* NMAP RESULTS */}
          {scan.scanType === "nmap" && scan.results?.nmap && (
            <div className="space-y-6">
              {/* OPEN PORTS */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">
                  Open Ports ({scan.results.nmap.totalPorts || 0})
                </h3>
                {scan.results.nmap.openPorts?.length > 0 ? (
                  <div className="space-y-2">
                    {scan.results.nmap.openPorts.map((port, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-100 dark:bg-gray-800 rounded"
                      >
                        <code className="text-sm">{port}</code>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No open ports detected</p>
                )}
              </Card>
              {/* FILTERED PORTS */}
              {scan.results.nmap.filteredPorts &&
                scan.results.nmap.filteredPorts.length > 0 && (
                  <Card className="p-6 border-2 border-yellow-500">
                    <h3 className="text-xl font-bold mb-4 text-yellow-600">
                      Filtered Ports (
                      {scan.results.nmap.filteredCount ||
                        scan.results.nmap.filteredPorts.length}
                      )
                    </h3>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded mb-4">
                      <p className="text-sm">
                        <strong>Note:</strong> Filtered ports are blocked by a
                        firewall. They may be open behind the firewall but are
                        not directly accessible.
                      </p>
                    </div>
                    <div className="space-y-2">
                      {scan.results.nmap.filteredPorts
                        .slice(0, 20)
                        .map((port, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-100 dark:bg-gray-800 rounded"
                          >
                            <code className="text-sm">{port}</code>
                          </div>
                        ))}
                      {scan.results.nmap.filteredPorts.length > 20 && (
                        <p className="text-sm text-gray-500 mt-2">
                          ... and {scan.results.nmap.filteredPorts.length - 20}{" "}
                          more filtered ports
                        </p>
                      )}
                    </div>
                  </Card>
                )}

              {/* PORT SUMMARY */}
              {scan.results.nmap.hostInfo?.portSummary && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Port Scan Summary</h3>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="font-mono text-sm">
                      {scan.results.nmap.hostInfo.portSummary}
                    </p>
                    {scan.results.nmap.hostInfo.notShown && (
                      <p className="font-mono text-sm mt-2">
                        {scan.results.nmap.hostInfo.notShown}
                      </p>
                    )}
                  </div>
                </Card>
              )}
              {/* CVE VULNERABILITIES */}
              {scan.results.nmap.cveList &&
                scan.results.nmap.cveList.length > 0 && (
                  <Card className="p-6 border-2 border-red-500">
                    <h3 className="text-xl font-bold mb-4 text-red-500">
                      CVE Vulnerabilities Found (
                      {scan.results.nmap.cveList.length})
                    </h3>
                    <div className="space-y-2">
                      {scan.results.nmap.cveList.map((cve, index) => (
                        <div
                          key={index}
                          className="p-3 bg-red-50 dark:bg-red-900/20 rounded flex justify-between items-center"
                        >
                          <code className="text-sm font-semibold">{cve}</code>
                          <a
                            href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline text-sm"
                          >
                            View Details
                          </a>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

              {/* VULNERABILITIES */}
              {scan.results.nmap.vulnerabilities &&
                scan.results.nmap.vulnerabilities.length > 0 && (
                  <Card className="p-6 border-2 border-orange-500">
                    <h3 className="text-xl font-bold mb-4 text-orange-500">
                      Vulnerabilities Detected (
                      {scan.results.nmap.vulnerabilities.length})
                    </h3>
                    <div className="space-y-2">
                      {scan.results.nmap.vulnerabilities.map((vuln, index) => (
                        <div
                          key={index}
                          className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded"
                        >
                          <p className="text-sm">{vuln}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

              {/* SERVICE VERSIONS */}
              {scan.results.nmap.serviceVersions &&
                scan.results.nmap.serviceVersions.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">Service Versions</h3>
                    <div className="space-y-2">
                      {scan.results.nmap.serviceVersions.map(
                        (service, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-100 dark:bg-gray-800 rounded"
                          >
                            <code className="text-sm">{service}</code>
                          </div>
                        )
                      )}
                    </div>
                  </Card>
                )}

              {/* OS DETECTION */}
              {scan.results.nmap.osDetection && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Operating System Detection
                  </h3>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="font-mono text-sm">
                      {scan.results.nmap.osDetection}
                    </p>
                  </div>
                </Card>
              )}
              {/* HOST INFORMATION */}
              {scan.results.nmap.hostInfo && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Host Information</h3>
                  <div className="space-y-2">
                    {scan.results.nmap.hostInfo.status && (
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                        <p className="text-sm">
                          {scan.results.nmap.hostInfo.status}
                        </p>
                      </div>
                    )}
                    {scan.results.nmap.hostInfo.serviceInfo && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-sm font-semibold mb-1">
                          Service Information
                        </p>
                        <p className="text-sm font-mono">
                          {scan.results.nmap.hostInfo.serviceInfo}
                        </p>
                      </div>
                    )}
                    {scan.results.nmap.hostInfo.cpe &&
                      scan.results.nmap.hostInfo.cpe.length > 0 && (
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                          <p className="text-sm font-semibold mb-1">
                            CPE (Common Platform Enumeration)
                          </p>
                          {scan.results.nmap.hostInfo.cpe.map((cpe, index) => (
                            <p key={index} className="text-xs font-mono">
                              {cpe}
                            </p>
                          ))}
                        </div>
                      )}
                  </div>
                </Card>
              )}

              {/* SSH HOST KEYS */}
              {scan.results.nmap.sshHostKeys &&
                scan.results.nmap.sshHostKeys.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">
                      SSH Host Key Algorithms
                    </h3>
                    <div className="space-y-2">
                      {scan.results.nmap.sshHostKeys.map((key, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-100 dark:bg-gray-800 rounded"
                        >
                          <code className="text-xs">{key}</code>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

              {/* HTTP SERVER INFO */}
              {scan.results.nmap.httpInfo &&
                scan.results.nmap.httpInfo.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">
                      HTTP Server Information
                    </h3>
                    <div className="space-y-2">
                      {scan.results.nmap.httpInfo.map((info, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-100 dark:bg-gray-800 rounded"
                        >
                          <code className="text-sm">{info}</code>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

              {/* RAW OUTPUT */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Raw Output</h3>
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">
                  <pre className="text-xs whitespace-pre-wrap">
                    {scan.results.nmap.rawOutput}
                  </pre>
                </div>
              </Card>
            </div>
          )}

          {/* NIKTO RESULTS */}
          {scan.scanType === "nikto" && scan.results?.nikto && (
            <div className="space-y-6">
              {/* TOTAL FINDINGS */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">
                  Total Findings: {scan.results.nikto.totalFindings || 0}
                </h3>

                {/* SERVER INFO */}
                {scan.results.nikto.serverInfo && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="text-sm">
                      <strong>Server: </strong> {scan.results.nikto.serverInfo}
                    </p>
                  </div>
                )}
              </Card>

              {/* CRITICAL FINDINGS */}
              {scan.results.nikto.criticalFindings &&
                scan.results.nikto.criticalFindings.length > 0 && (
                  <Card className="p-6 border-2 border-red-600">
                    <h3 className="text-xl font-bold mb-4 text-red-600">
                      Critical Findings (
                      {scan.results.nikto.criticalFindings.length})
                    </h3>
                    <div className="space-y-2">
                      {scan.results.nikto.criticalFindings.map(
                        (finding, index) => (
                          <div
                            key={index}
                            className="p-3 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-600"
                          >
                            <p className="text-sm">{finding}</p>
                          </div>
                        )
                      )}
                    </div>
                  </Card>
                )}

              {/* HIGH FINDINGS */}
              {scan.results.nikto.highFindings &&
                scan.results.nikto.highFindings.length > 0 && (
                  <Card className="p-6 border-2 border-orange-500">
                    <h3 className="text-xl font-bold mb-4 text-orange-500">
                      High Severity Findings (
                      {scan.results.nikto.highFindings.length})
                    </h3>
                    <div className="space-y-2">
                      {scan.results.nikto.highFindings.map((finding, index) => (
                        <div
                          key={index}
                          className="p-3 bg-orange-50 dark: bg-orange-900/20 rounded border-l-4 border-orange-500"
                        >
                          <p className="text-sm">{finding}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

              {/* MEDIUM FINDINGS */}
              {scan.results.nikto.mediumFindings &&
                scan.results.nikto.mediumFindings.length > 0 && (
                  <Card className="p-6 border-2 border-yellow-500">
                    <h3 className="text-xl font-bold mb-4 text-yellow-600">
                      Medium Severity Findings (
                      {scan.results.nikto.mediumFindings.length})
                    </h3>
                    <div className="space-y-2">
                      {scan.results.nikto.mediumFindings.map(
                        (finding, index) => (
                          <div
                            key={index}
                            className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-500"
                          >
                            <p className="text-sm">{finding}</p>
                          </div>
                        )
                      )}
                    </div>
                  </Card>
                )}

              {/* LOW FINDINGS */}
              {scan.results.nikto.lowFindings &&
                scan.results.nikto.lowFindings.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">
                      Low Severity Findings (
                      {scan.results.nikto.lowFindings.length})
                    </h3>
                    <div className="space-y-2">
                      {scan.results.nikto.lowFindings.map((finding, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-100 dark:bg-gray-800 rounded"
                        >
                          <p className="text-sm">{finding}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

              {/* ALL FINDINGS FALLBACK */}
              {!scan.results.nikto.criticalFindings &&
                scan.results.nikto.findings &&
                scan.results.nikto.findings.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">All Findings</h3>
                    <div className="space-y-2">
                      {scan.results.nikto.findings.map((finding, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-100 dark:bg-gray-800 rounded"
                        >
                          <p className="text-sm">{finding}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
            </div>
          )}

          {/* SSL RESULTS */}
          {scan.scanType === "ssl" && scan.results?.ssl && (
            <div className="space-y-6">
              {/* TOTAL ISSUES */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">
                  Total Issues: {scan.results.ssl.totalIssues || 0}
                </h3>

                {/* TLS SUPPORT STATUS */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div
                    className={`p-4 rounded ${
                      scan.results.ssl.supportsTLS13
                        ? "bg-green-50 dark:bg-green-900/20"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <p className="text-sm font-semibold">TLS 1.3</p>
                    <p
                      className={`text-lg ${
                        scan.results.ssl.supportsTLS13
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {scan.results.ssl.supportsTLS13
                        ? "SUPPORTED"
                        : "NOT SUPPORTED"}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded ${
                      scan.results.ssl.supportsTLS12
                        ? "bg-green-50 dark:bg-green-900/20"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <p className="text-sm font-semibold">TLS 1.2</p>
                    <p
                      className={`text-lg ${
                        scan.results.ssl.supportsTLS12
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {scan.results.ssl.supportsTLS12
                        ? "SUPPORTED"
                        : "NOT SUPPORTED"}
                    </p>
                  </div>
                </div>
              </Card>

              {/* CERTIFICATE DETAILS */}
              {scan.results.ssl.certificateDetails &&
                Object.keys(scan.results.ssl.certificateDetails).length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">
                      Certificate Details
                    </h3>
                    <div className="space-y-3">
                      {scan.results.ssl.certificateDetails.subject && (
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                          <p className="text-sm font-semibold mb-1">Subject</p>
                          <p className="text-sm font-mono">
                            {scan.results.ssl.certificateDetails.subject}
                          </p>
                        </div>
                      )}
                      {scan.results.ssl.certificateDetails.issuer && (
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                          <p className="text-sm font-semibold mb-1">Issuer</p>
                          <p className="text-sm font-mono">
                            {scan.results.ssl.certificateDetails.issuer}
                          </p>
                        </div>
                      )}
                      {scan.results.ssl.certificateDetails.validFrom && (
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                          <p className="text-sm font-semibold mb-1">
                            Valid From
                          </p>
                          <p className="text-sm">
                            {scan.results.ssl.certificateDetails.validFrom}
                          </p>
                        </div>
                      )}
                      {scan.results.ssl.certificateDetails.validTo && (
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                          <p className="text-sm font-semibold mb-1">
                            Valid Until
                          </p>
                          <p className="text-sm">
                            {scan.results.ssl.certificateDetails.validTo}
                          </p>
                        </div>
                      )}
                      {scan.results.ssl.certificateDetails
                        .signatureAlgorithm && (
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                          <p className="text-sm font-semibold mb-1">
                            Signature Algorithm
                          </p>
                          <p className="text-sm font-mono">
                            {
                              scan.results.ssl.certificateDetails
                                .signatureAlgorithm
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

              {/* CRITICAL ISSUES */}
              {scan.results.ssl.criticalIssues &&
                scan.results.ssl.criticalIssues.length > 0 && (
                  <Card className="p-6 border-2 border-red-600">
                    <h3 className="text-xl font-bold mb-4 text-red-600">
                      Critical Issues ({scan.results.ssl.criticalIssues.length})
                    </h3>
                    <div className="space-y-2">
                      {scan.results.ssl.criticalIssues.map((issue, index) => (
                        <div
                          key={index}
                          className="p-3 bg-red-50 dark: bg-red-900/20 rounded border-l-4 border-red-600"
                        >
                          <p className="text-sm">{issue}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

              {/* DEPRECATED PROTOCOLS */}
              {scan.results.ssl.deprecatedProtocols &&
                scan.results.ssl.deprecatedProtocols.length > 0 && (
                  <Card className="p-6 border-2 border-orange-500">
                    <h3 className="text-xl font-bold mb-4 text-orange-500">
                      Deprecated Protocols (
                      {scan.results.ssl.deprecatedProtocols.length})
                    </h3>
                    <div className="space-y-2">
                      {scan.results.ssl.deprecatedProtocols.map(
                        (protocol, index) => (
                          <div
                            key={index}
                            className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded"
                          >
                            <p className="text-sm font-mono">{protocol}</p>
                          </div>
                        )
                      )}
                    </div>
                  </Card>
                )}

              {/* WEAK CIPHERS */}
              {scan.results.ssl.weakCiphers &&
                scan.results.ssl.weakCiphers.length > 0 && (
                  <Card className="p-6 border-2 border-yellow-500">
                    <h3 className="text-xl font-bold mb-4 text-yellow-600">
                      Weak Ciphers ({scan.results.ssl.weakCiphers.length})
                    </h3>
                    <div className="space-y-2">
                      {scan.results.ssl.weakCiphers.map((cipher, index) => (
                        <div
                          key={index}
                          className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded"
                        >
                          <p className="text-sm font-mono">{cipher}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

              {/* CERTIFICATE ISSUES */}
              {scan.results.ssl.certificateIssues &&
                scan.results.ssl.certificateIssues.length > 0 && (
                  <Card className="p-6 border-2 border-red-500">
                    <h3 className="text-xl font-bold mb-4 text-red-500">
                      Certificate Issues (
                      {scan.results.ssl.certificateIssues.length})
                    </h3>
                    <div className="space-y-2">
                      {scan.results.ssl.certificateIssues.map(
                        (issue, index) => (
                          <div
                            key={index}
                            className="p-3 bg-red-50 dark:bg-red-900/20 rounded"
                          >
                            <p className="text-sm">{issue}</p>
                          </div>
                        )
                      )}
                    </div>
                  </Card>
                )}

              {/* ALL ISSUES FALLBACK */}
              {!scan.results.ssl.criticalIssues &&
                scan.results.ssl.issues &&
                scan.results.ssl.issues.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">All Issues</h3>
                    <div className="space-y-2">
                      {scan.results.ssl.issues.map((issue, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-100 dark:bg-gray-800 rounded"
                        >
                          <p className="text-sm">{issue}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
            </div>
          )}

          {/* SQLMAP RESULTS */}
          {scan.scanType === "sqlmap" && scan.results?.sqlmap && (
            <div className="space-y-6">
              {/* VULNERABILITY STATUS */}
              <Card
                className={`p-6 border-2 ${
                  scan.results.sqlmap.vulnerable
                    ? "border-red-600"
                    : "border-green-500"
                }`}
              >
                <h3
                  className={`text-2xl font-bold mb-4 ${
                    scan.results.sqlmap.vulnerable
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {scan.results.sqlmap.vulnerable
                    ? "VULNERABLE TO SQL INJECTION"
                    : "NO SQL INJECTION DETECTED"}
                </h3>

                {/* DETAILED INFO */}
                {scan.results.sqlmap.details && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {scan.results.sqlmap.details.dbms && (
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                        <p className="text-sm font-semibold mb-1">
                          Database Type
                        </p>
                        <p className="text-sm">
                          {scan.results.sqlmap.details.dbms}
                        </p>
                      </div>
                    )}
                    {scan.results.sqlmap.details.injectionType && (
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                        <p className="text-sm font-semibold mb-1">
                          Injection Type
                        </p>
                        <p className="text-sm">
                          {scan.results.sqlmap.details.injectionType}
                        </p>
                      </div>
                    )}
                    {scan.results.sqlmap.details.databasesFound !== undefined &&
                      scan.results.sqlmap.details.databasesFound > 0 && (
                        <div className="p-3 bg-gray-100 dark: bg-gray-800 rounded">
                          <p className="text-sm font-semibold mb-1">
                            Databases Found
                          </p>
                          <p className="text-sm">
                            {scan.results.sqlmap.details.databasesFound}
                          </p>
                        </div>
                      )}
                    {scan.results.sqlmap.details.tablesFound !== undefined &&
                      scan.results.sqlmap.details.tablesFound > 0 && (
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                          <p className="text-sm font-semibold mb-1">
                            Tables Found
                          </p>
                          <p className="text-sm">
                            {scan.results.sqlmap.details.tablesFound}
                          </p>
                        </div>
                      )}
                    {scan.results.sqlmap.details.payload && (
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded col-span-2">
                        <p className="text-sm font-semibold mb-1">
                          Payload Used
                        </p>
                        <p className="text-xs font-mono break-all">
                          {scan.results.sqlmap.details.payload}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* INJECTION POINTS */}
              {scan.results.sqlmap.injectionPoints &&
                scan.results.sqlmap.injectionPoints.length > 0 && (
                  <Card className="p-6 border-2 border-red-500">
                    <h3 className="text-xl font-bold mb-4 text-red-500">
                      Injection Points (
                      {scan.results.sqlmap.injectionPoints.length})
                    </h3>
                    <div className="space-y-2">
                      {scan.results.sqlmap.injectionPoints.map(
                        (point, index) => (
                          <div
                            key={index}
                            className="p-3 bg-red-50 dark:bg-red-900/20 rounded"
                          >
                            <p className="text-sm font-mono">{point}</p>
                          </div>
                        )
                      )}
                    </div>
                  </Card>
                )}

              {/* DATABASES FOUND */}
              {scan.results.sqlmap.databases &&
                scan.results.sqlmap.databases.length > 0 && (
                  <Card className="p-6 border-2 border-purple-500">
                    <h3 className="text-xl font-bold mb-4 text-purple-600">
                      Databases Enumerated (
                      {scan.results.sqlmap.databases.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {scan.results.sqlmap.databases.map((db, index) => (
                        <div
                          key={index}
                          className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded text-center"
                        >
                          <p className="text-sm font-mono font-semibold">
                            {db}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

              {/* TABLES FOUND */}
              {scan.results.sqlmap.tables &&
                scan.results.sqlmap.tables.length > 0 && (
                  <Card className="p-6 border-2 border-blue-500">
                    <h3 className="text-xl font-bold mb-4 text-blue-600">
                      Tables Enumerated ({scan.results.sqlmap.tables.length})
                    </h3>
                    <div className="space-y-2">
                      {scan.results.sqlmap.tables.map((table, index) => (
                        <div
                          key={index}
                          className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded"
                        >
                          <p className="text-sm font-mono">{table}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

              {/* VULNERABILITIES */}
              {scan.results.sqlmap.vulnerabilities &&
                scan.results.sqlmap.vulnerabilities.length > 0 && (
                  <Card className="p-6 border-2 border-red-600">
                    <h3 className="text-xl font-bold mb-4 text-red-600">
                      Vulnerabilities (
                      {scan.results.sqlmap.vulnerabilities.length})
                    </h3>
                    <div className="space-y-2">
                      {scan.results.sqlmap.vulnerabilities.map(
                        (vuln, index) => (
                          <div
                            key={index}
                            className="p-3 bg-red-50 dark:bg-red-900/20 rounded"
                          >
                            <p className="text-sm">{vuln}</p>
                          </div>
                        )
                      )}
                    </div>
                  </Card>
                )}

              {/* WARNINGS */}
              {scan.results.sqlmap.warnings &&
                scan.results.sqlmap.warnings.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">Warnings</h3>
                    <div className="space-y-2">
                      {scan.results.sqlmap.warnings.map((warning, index) => (
                        <div
                          key={index}
                          className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded"
                        >
                          <p className="text-sm">{warning}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
