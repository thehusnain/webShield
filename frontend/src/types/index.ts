// User data structure
export interface User {
  id: string;
  username: string;
  email: string;
  role?: 'user' | 'admin';
  scanLimit?: number;
  scansUsed?: number;
}

// Authentication context methods
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Scan types
export type ScanType = 'nmap' | 'nikto' | 'ssl' | 'sqlmap';

// Scan status
export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// Scan object structure
export interface Scan {
  _id: string;
  userId: string;
  targetUrl: string;
  scanType: ScanType;
  status: ScanStatus;
  results?: ScanResults;
  reportContent?: string;
  reportGeneratedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Scan results structure
export interface ScanResults {
  nmap?: {
    openPorts: string[];
    rawOutput: string;
  };
  nikto?: {
    totalFindings: number;
    findings: string[];
  };
  ssl?: {
    totalIssues: number;
    issues: string[];
  };
  sqlmap?: {
    vulnerable: boolean;
    vulnerabilities: string[];
  };
}

// Theme mode
export type ThemeMode = 'light' | 'dark';

// Theme context methods
export interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
}
