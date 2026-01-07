# WebShield 

WebShield is a beginner-friendly frontend React app for scanning websites for vulnerabilities using popular security tools.

## Features

- User authentication (login/logout)
- Scan websites for vulnerabilities with tools  Nmap, Nikto, SQLMap, SSLScan
- Dashboard to see scan history and usage
- Beautiful UI with animated icons
- Intelligent form validation for URLs, email, password, etc.
- Protected routes (dashboard, scan pages) for logged-in users

## Technologies Used

- **React** (with TypeScript & Vite)
- **Axios** (for API calls)
- **React Router** (page navigation)
- **Lottie React** (pretty animations)
- **Custom Context** (auth and user data)
- **CSS / Tailwind** (for styling)

##  Workflow

1. **User logs in/signup**
2. **Chooses a security tool & enters a website URL**
3. **App validates inputs and starts a scan**
4. **Shows scan progress and results**
5. **User can view past scans on their dashboard**



1. **Install dependencies**
    ```bash
    npm install
    ```

2. **Set environment variables**
    - Create a `.env` file in root:
      ```
      VITE_API_URL=http://localhost:4000
      ```
      *(or public backend URL for production)*

3. **Run development server**
    ```bash
    npm run dev
    ```
    The app will open at [http://localhost:5173](http://localhost:5173)

## Key Concepts

- **`useState`** – Save and update values in your component.
- **`useEffect`** – Run code after page loads or something changes.
- **`useContext`** – Share login/user info to all pages.
- **Form validation** – Keep data clean and safe before starting a scan.
- **Protected Routes** – Only show dashboard and scanning pages to logged-in users.

##  Example Usage

- Start a scan with a valid web address (e.g. `https://example.com`)
- Choose a tool (Nmap, Nikto, etc.)
- View live progress & result
- Check dashboard for previous scans

## Legal & Ethical Notes

- Only scan websites you *own* or *have permission* to test.
- This tool is for educational and ethical use only!

---
