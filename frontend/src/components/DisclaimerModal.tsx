import { useState } from "react";
import Card from "./common/Card";
import Button from "./common/Button";

interface DisclaimerModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

export default function DisclaimerModal({
  onAccept,
  onDecline,
}: DisclaimerModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    if (!agreed) {
      alert("⚠️ Please read and check the agreement box to continue");
      return;
    }

    setIsAccepting(true);
    await onAccept();
  };

  const handleDecline = () => {
    if (
      window.confirm(
        "⚠️ You must agree to the terms to use WebShield. Are you sure you want to decline?"
      )
    ) {
      onDecline();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Prevent closing by clicking outside */}
      <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />

      <Card className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp border-2 border-red-500/50">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-4 animate-pulse">
            <span className="text-5xl">⚠️</span>
          </div>
          <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
            Legal Disclaimer & Terms of Use
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please read carefully before using WebShield
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          {/* Main Warning */}
          <div className="bg-red-500/10 border-2 border-red-500 rounded-lg p-6 animate-pulse">
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">🚨</span>
              <div>
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                  CRITICAL WARNING
                </h3>
                <p className="font-semibold text-red-700 dark:text-red-300">
                  Scanning websites without explicit written permission is
                  ILLEGAL and may result in:
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Criminal prosecution under computer fraud laws</li>
                  <li>• Civil lawsuits and financial penalties</li>
                  <li>• Permanent criminal record</li>
                  <li>• Account termination and blacklisting</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Terms List */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📋</span> Terms & Conditions
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <span className="text-2xl flex-shrink-0">✅</span>
                <div>
                  <h4 className="font-bold mb-1">Authorized Use Only</h4>
                  <p className="text-sm">
                    You may ONLY scan websites that you own, operate, or have
                    explicit written permission to test. Keep documentation of
                    authorization.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <span className="text-2xl flex-shrink-0">🎓</span>
                <div>
                  <h4 className="font-bold mb-1">Educational Purpose</h4>
                  <p className="text-sm">
                    WebShield is designed for educational purposes, security
                    research, and authorized penetration testing only.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <span className="text-2xl flex-shrink-0">⚖️</span>
                <div>
                  <h4 className="font-bold mb-1">Legal Compliance</h4>
                  <p className="text-sm">
                    You are solely responsible for ensuring your use complies
                    with all applicable local, state, national, and
                    international laws including but not limited to: Computer
                    Fraud and Abuse Act (CFAA), GDPR, and similar regulations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <span className="text-2xl flex-shrink-0">🛡️</span>
                <div>
                  <h4 className="font-bold mb-1">No Liability</h4>
                  <p className="text-sm">
                    WebShield and its creators are NOT liable for any misuse,
                    damages, legal consequences, or losses resulting from use of
                    this tool. Use at your own risk.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <span className="text-2xl flex-shrink-0">🚫</span>
                <div>
                  <h4 className="font-bold mb-1">Prohibited Activities</h4>
                  <p className="text-sm">
                    Strictly prohibited: Unauthorized access, data theft, system
                    disruption, malicious attacks, or any activity that violates
                    laws or terms of service of target systems.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <span className="text-2xl flex-shrink-0">📝</span>
                <div>
                  <h4 className="font-bold mb-1">Logging & Monitoring</h4>
                  <p className="text-sm">
                    All scans are logged with timestamps, IP addresses, and
                    target URLs. Logs may be shared with law enforcement if
                    illegal activity is detected.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ethical Guidelines */}
          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <span>🤝</span> Ethical Guidelines
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Always obtain written permission before scanning</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>
                  Respect rate limits and avoid overloading target systems
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Report discovered vulnerabilities responsibly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Never exploit vulnerabilities for personal gain</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Maintain confidentiality of security findings</span>
              </li>
            </ul>
          </div>

          {/* Age Restriction */}
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <span className="font-bold">⚠️ Age Restriction: </span> You must
              be 18 years or older to use WebShield. By accepting, you confirm
              you meet this requirement.
            </p>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <span className="text-sm font-medium group-hover:text-primary transition-colors">
              I have read, understood, and agree to comply with all terms,
              conditions, and legal disclaimers stated above. I confirm that I
              will only use WebShield for authorized, legal, and ethical
              security testing purposes. I understand that unauthorized use may
              result in criminal prosecution.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Button
            onClick={handleAccept}
            disabled={!agreed}
            isLoading={isAccepting}
            className={`flex-1 ${
              !agreed
                ? "opacity-50 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            }`}
          >
            {agreed ? (
              <>
                <span className="mr-2">✓</span>I Agree - Continue to WebShield
              </>
            ) : (
              <>
                <span className="mr-2">⚠️</span>
                Please Read & Check Agreement
              </>
            )}
          </Button>

          <Button
            onClick={handleDecline}
            variant="danger"
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500"
          >
            <span className="mr-2">✗</span>I Decline - Logout
          </Button>
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark: text-gray-400">
            Last Updated: December 28, 2025 | By using WebShield, you
            acknowledge that you have read and agree to these terms
          </p>
        </div>
      </Card>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform:  translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        . animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation:  slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
