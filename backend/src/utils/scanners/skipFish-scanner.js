import {exec} from "child_process";
import { promisify} from "util";

const execAsync = promisify(exec);

export async function scanWithSkipfish(targetUrl) {
    try {
        console.log(`Starting Skipfish scan for: ${targetUrl}`);
        const reportDir = `/tmp/skipfish-${Date.now()}`;
        const command = `skipfish -o ${reportDir} ${targetUrl}`;
        await execAsync(command);
        
        const reportPath = `${reportDir}/index.html`;
        const vulnerabilities = [];

    
        console.log(` Skipfish completed! Report saved at: ${reportDir}`);
        
        return {
            reportPath: reportDir,
            message: "Scan completed. Check HTML report for vulnerabilities."
        };
        
    } catch (error) {
        console.log('Skipfish error:', error.message);
        return {
            reportPath: null,
            error: error.message
        };
    }
}