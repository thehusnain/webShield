import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

export default function Home() {
  return (
    <div className="page-container">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />

        <div className="content-wrapper relative">
          <div className="flex flex-col items-center text-center py-20 space-y-8">
            {/* Animated shield icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
              <div className="relative w-32 h-32 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center animate-float cyber-glow">
                <span className="text-6xl">🛡️</span>
              </div>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md: text-7xl font-bold">
              <span className="text-gradient">WebShield</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl">
              Professional Web Security Scanner powered by industry-standard tools
            </p>

            {/* Description */}
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
              Comprehensive vulnerability assessment using
              <span className="text-primary font-semibold">
                {' '}
                Nmap, Nikto, SQLMap, and SSL Scanner
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Link to="/signup">
                <button className="btn-primary px-8 py-4 text-lg hover:scale-105">
                  Get Started
                </button>
              </Link>
              <a href="#services">
                <button className="btn-secondary px-8 py-4 text-lg hover:scale-105">
                  Learn More
                </button>
              </a>
            </div>

            {/* Trust badges - FIXED:  Removed broken icons */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-12 text-sm text-gray-500 dark: text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <span>Fast Scanning</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔒</span>
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <span>Detailed Reports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-light-card dark:bg-dark-card/50">
        <div className="content-wrapper py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-gradient">Security Tools</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Industry-standard scanning tools at your fingertips
            </p>
          </div>

          {/* Service cards grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Nmap Card */}
            <div className="card p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-blue-500">Nmap</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Network exploration and port scanning to discover open services
              </p>
              <ul className="space-y-1 text-sm text-gray-500 dark:text-gray-500">
                <li>• Port scanning</li>
                <li>• Service detection</li>
                <li>• OS detection</li>
              </ul>
            </div>

            {/* Nikto Card - FIXED: Line 113 was here with broken SVG */}
            <div className="card p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-red-500">Nikto</h3>
              <p className="text-gray-600 dark: text-gray-400 text-sm mb-4">
                Web server scanner for dangerous files and outdated versions
              </p>
              <ul className="space-y-1 text-sm text-gray-500 dark:text-gray-500">
                <li>• Vulnerability scanning</li>
                <li>• CGI testing</li>
                <li>• Server enumeration</li>
              </ul>
            </div>

            {/* SQLMap Card */}
            <div className="card p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">💉</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-yellow-500">SQLMap</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Automated SQL injection detection and database takeover tool
              </p>
              <ul className="space-y-1 text-sm text-gray-500 dark:text-gray-500">
                <li>• SQL injection detection</li>
                <li>• Database fingerprinting</li>
                <li>• Data extraction</li>
              </ul>
            </div>

            {/* SSL Card */}
            <div className="card p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-green-500">SSL Scanner</h3>
              <p className="text-gray-600 dark: text-gray-400 text-sm mb-4">
                SSL/TLS cipher suite analysis and certificate verification
              </p>
              <ul className="space-y-1 text-sm text-gray-500 dark:text-gray-500">
                <li>• Cipher enumeration</li>
                <li>• Protocol testing</li>
                <li>• Certificate validation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="content-wrapper py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold mb-6">
            <span className="text-gradient">About WebShield</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            WebShield is a comprehensive web security scanning platform that leverages
            industry-standard penetration testing tools to identify vulnerabilities in web
            applications. Our platform makes professional security testing accessible to everyone.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Built with security professionals and developers in mind, WebShield automates the
            scanning process while providing detailed, actionable reports to help secure your web
            applications.
          </p>
        </div>
      </section>

      {/* Disclaimer Section - FIXED: Replaced broken SVG */}
      <section className="bg-red-500/10 border-t border-b border-red-500/30">
        <div className="content-wrapper py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-500 mb-4">Important Notice</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>For educational purposes only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Always obtain written permission before scanning any website</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Unauthorized scanning may be illegal in your jurisdiction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Use responsibly and ethically</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-light-card dark:bg-dark-card border-t border-light-border dark:border-dark-border">
        <div className="content-wrapper py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 WebShield. All rights reserved.</p>
            <p className="text-sm mt-2">Professional Web Security Scanner</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
