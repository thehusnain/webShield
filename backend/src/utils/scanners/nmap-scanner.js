import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function scanWithNmap(targetUrl) {
    try {
        let domain = targetUrl.replace('https://', '').replace('http://', ''); 
        console.log(`Scanning: ${domain}`);
        // RUN NMAP
    const { stdout } = await execAsync(`nmap -F ${domain}`);
        
        // SIMPLE RESULT PROCESSING
        const lines = stdout.split('\n');
        const openPorts = [];
        
        for (const line of lines) {
            if (line.includes('open') && line.includes('/tcp')) {
                const words = line.trim().split(' ');
                
                if (words.length >= 3) {
                    const portNumber = words[0].split('/')[0];
                    const serviceName = words[2];
                    
                    openPorts.push({
                        port: parseInt(portNumber),
                        service: serviceName,
                        status: 'open'
                    });
                }
            }
        }
        
        return {
            openPorts: openPorts,
            totalOpenPorts: openPorts.length
        };
        
    } catch (error) {
        console.log('Scan failed:', error.message);
        throw error;
    }
}