// USER DATA STRUCTURE
export interface User {
  id: string;
  username: string;
  email:  string;
  role?: 'user' | 'admin';
  scanLimit?: number;
  usedScan?: number;
  agreedToTerms?: boolean;
}

// AUTHENTICATION CONTEXT METHODS
export interface AuthContextType {
  user: User | null;
  isAuthenticated:  boolean;
  loading: boolean; // ADDED:  LOADING STATE
  login: (email: string, password: string) => Promise<void>;
  signup:  (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// SCAN TYPES
export type ScanType = 'nmap' | 'nikto' | 'ssl' | 'sqlmap';

// SCAN STATUS
export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// NMAP SCAN RESULT STRUCTURE
export interface NmapResult {
  tool: string;
  success: boolean;
  openPorts: string[];
  totalPorts: number;
  filteredPorts?:  string[]; // ADDED
  filteredCount?: number; // ADDED
  closedPorts?:  string[]; // ADDED
  serviceVersions?: string[];
  vulnerabilities?: string[];
  cveList?: string[];
  osDetection?: string;
  hostInfo?: {
    status?: string;
    serviceInfo?:  string;
    cpe?: string[];
    portSummary?: string; // ADDED
    notShown?: string; // ADDED
    warnings?: string[]; // ADDED
    networkDistance?: string;
  };
  sshHostKeys?: string[];
  httpInfo?: string[];
  rawOutput:  string;
  target: string;
  error?: string;
}
// NIKTO SCAN RESULT STRUCTURE
export interface NiktoResult {
  tool: string;
  success: boolean;
  totalFindings: number;
  findings: string[];
  criticalFindings?: string[]; // ADDED: CRITICAL SEVERITY FINDINGS
  highFindings?:  string[]; // ADDED: HIGH SEVERITY FINDINGS
  mediumFindings?: string[]; // ADDED: MEDIUM SEVERITY FINDINGS
  lowFindings?: string[]; // ADDED: LOW SEVERITY FINDINGS
  serverInfo?: string; // ADDED: WEB SERVER INFORMATION
  rawOutput: string;
  target: string;
  error?: string;
}

// SSL/TLS SCAN RESULT STRUCTURE
export interface SslResult {
  tool: string;
  success: boolean;
  totalIssues: number;
  issues:  string[];
  criticalIssues?: string[]; // ADDED: CRITICAL SSL/TLS ISSUES
  weakCiphers?: string[]; // ADDED: WEAK CIPHER SUITES
  deprecatedProtocols?: string[]; // ADDED:  DEPRECATED PROTOCOLS (SSLV2, SSLV3, TLS1.0, TLS1.1)
  certificateIssues?:  string[]; // ADDED:  CERTIFICATE SPECIFIC PROBLEMS
  certificateDetails?: { // ADDED: FULL CERTIFICATE INFORMATION
    subject?: string;
    issuer?: string;
    validFrom?: string;
    validTo?: string;
    signatureAlgorithm?: string;
  };
  supportsTLS12?:  boolean; // ADDED: TLS 1.2 SUPPORT STATUS
  supportsTLS13?: boolean; // ADDED: TLS 1.3 SUPPORT STATUS
  rawOutput: string;
  domain: string;
  target?:  string;
  summary?:  string;
  error?: string;
}

// SQLMAP SCAN RESULT STRUCTURE
export interface SqlmapResult {
  tool: string;
  success: boolean;
  vulnerable: boolean;
  vulnerabilities:  string[];
  warnings: string[];
  databases?: string[]; // ADDED: ENUMERATED DATABASE NAMES
  tables?: string[]; // ADDED: ENUMERATED TABLE NAMES
  injectionPoints?: string[]; // ADDED: DETECTED INJECTION POINTS
  details:  {
    testedUrl: string;
    dbms?: string;
    injectionType?: string;
    payload?: string; // ADDED: ACTUAL PAYLOAD USED IN SUCCESSFUL INJECTION
    findingsCount: number;
    databasesFound?: number; // ADDED: TOTAL NUMBER OF DATABASES FOUND
    tablesFound?: number; // ADDED: TOTAL NUMBER OF TABLES FOUND
  };
  rawOutput: string;
  target: string;
  summary: string;
  error?: string;
}

// COMPLETE SCAN RESULTS STRUCTURE
export interface ScanResults {
  nmap?: NmapResult;
  nikto?: NiktoResult;
  ssl?: SslResult;
  sqlmap?: SqlmapResult;
}

// SCAN OBJECT STRUCTURE
export interface Scan {
  _id: string;
  userId: string;
  targetUrl: string;
  scanType: ScanType;
  status: ScanStatus;
  results?: ScanResults;
  reportContent?: string;
  reportGeneratedAt?: string;
  error?: string; // ADDED: ERROR MESSAGE IF SCAN FAILED
  progress?: number; // ADDED: SCAN PROGRESS PERCENTAGE (0-100)
  createdAt: string;
  updatedAt: string;
  completedAt?: string; // ADDED: TIMESTAMP WHEN SCAN COMPLETED
}

// ADMIN DASHBOARD - USER WITH SCAN INFO
export interface AdminUser {
  _id: string;
  username:  string;
  email: string;
  role: string;
  createdAt: string;
  scanLimit:  number;
  usedScan: number;
  agreedToTerms?:  boolean;
}

// ADMIN DASHBOARD - SCAN WITH USER INFO
export interface AdminScan {
  _id: string;
  targetUrl: string;
  scanType: ScanType;
  status: ScanStatus;
  createdAt: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
}

// ADMIN STATS STRUCTURE
export interface AdminStats {
  totalUsers: number;
  totalScans: number;
  activeScans: number;
  recentUsers: AdminUser[];
  recentScans: AdminScan[];
}

// API RESPONSE STRUCTURE
export interface ApiResponse<T = any> {
  success: boolean;
  message?:  string;
  data?: T;
  error?: string;
}

// SCAN HISTORY ITEM
export interface ScanHistoryItem {
  _id: string;
  targetUrl: string;
  scanType: ScanType;
  status: ScanStatus;
  createdAt: string;
  completedAt?: string;
  hasReport?: boolean;
  totalFindings?:  number; // ADDED: QUICK SUMMARY OF FINDINGS
}

// REPORT GENERATION STATUS
export interface ReportStatus {
  scanId: string;
  reportGenerated: boolean;
  generatedAt?:  string;
  message?: string;
}

// THEME MODE
export type ThemeMode = 'light' | 'dark';

// THEME CONTEXT METHODS
export interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
}

// SEVERITY LEVELS FOR FINDINGS
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

// VULNERABILITY FINDING STRUCTURE
export interface VulnerabilityFinding {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  cve?:  string; // ADDED: CVE IDENTIFIER IF APPLICABLE
  category: string;
  remediation?:  string;
  references?: string[];
}

// FORM VALIDATION ERROR
export interface ValidationError {
  field: string;
  message:  string;
}

// PAGINATION DATA
export interface PaginationData {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
}

// NOTIFICATION/ALERT TYPES
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id:  string;
  type: NotificationType;
  message: string;
  timestamp: Date;
  read?: boolean;
}