import PDFDocument from 'pdfkit';

export async function generateScanReport(scanData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4'
      });
      
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);
      
      // ========== HEADER ==========
      doc.fillColor('#2d3748')
         .fontSize(24)
         .text('Scan Report', 0, 50, { align: 'center' });
      
      doc.fillColor('#718096')
         .fontSize(14)
         .text(scanData.targetUrl, 0, 85, { align: 'center' });
      
      doc.fillColor('#a0aec0')
         .fontSize(10)
         .text(`Scan ID: ${scanData._id.toString().slice(-8)} | Generated: ${new Date().toLocaleDateString()}`, 
               0, 105, { align: 'center' });
      
      doc.strokeColor('#4299e1')
         .lineWidth(1)
         .moveTo(50, 125)
         .lineTo(550, 125)
         .stroke();
      
      // ========== SECTION 1: SCAN RESULTS ==========
      doc.fillColor('#2d74da')
         .fontSize(18)
         .text('Scan Results', 50, 155);
      
      let yPosition = 195;
      
      // Extract data
      const ports = scanData.findings?.openPorts || [];
      const directories = scanData.findings?.hiddenDirectories || [];
      
      // Open Ports
      if (ports.length > 0) {
        doc.fillColor('#2d3748')
           .fontSize(14)
           .text('Open Ports Found:', 70, yPosition);
        
        ports.forEach((port, i) => {
          const service = getServiceName(port.port);
          const riskLevel = getPortRiskLevel(port.port);
          const riskColor = getRiskColor(riskLevel);
          
          doc.fillColor(riskColor)
             .fontSize(12)
             .text(`• Port ${port.port} (${service}) - ${riskLevel} Risk`, 90, yPosition + 25 + (i * 20));
        });
        yPosition += 50 + (ports.length * 20);
      } else {
        doc.fillColor('#2d3748')
           .fontSize(14)
           .text('Open Ports Found:', 70, yPosition);
        
        doc.fillColor('#48bb78')
           .fontSize(12)
           .text('• No open ports detected', 90, yPosition + 25);
        yPosition += 70;
      }
      
      // Hidden Directories
      if (directories.length > 0) {
        doc.fillColor('#2d3748')
           .fontSize(14)
           .text('Hidden Directories Found:', 70, yPosition);
        
        directories.slice(0, 10).forEach((dir, i) => {
          doc.fillColor('#4a5568')
             .fontSize(12)
             .text(`• ${dir}`, 90, yPosition + 25 + (i * 20));
        });
        yPosition += 50 + (Math.min(directories.length, 10) * 20);
      }
      
      // ========== SECTION 2: SECURITY ASSESSMENT ==========
      doc.fillColor('#2d3748')
         .fontSize(18)
         .text('Security Assessment', 50, yPosition + 20);
      
      yPosition += 60;
      
      // ========== WEAKNESSES FOUND ==========
      doc.fillColor('#f56565')
         .fontSize(16)
         .text('Weaknesses Found', 70, yPosition);
      
      yPosition += 40;
      
      const weaknesses = [];
      
      // Check for HIGH RISK ports (these are actual weaknesses)
      const highRiskPorts = ports.filter(port => getPortRiskLevel(port.port) === 'High');
      if (highRiskPorts.length > 0) {
        highRiskPorts.forEach(port => {
          const service = getServiceName(port.port);
          weaknesses.push(`Port ${port.port} (${service}) exposed - High risk service should not be publicly accessible`);
        });
      }
      
      // Check for MEDIUM RISK ports with specific conditions
      const mediumRiskPorts = ports.filter(port => getPortRiskLevel(port.port) === 'Medium');
      const riskyMediumPorts = mediumRiskPorts.filter(port => {
        // HTTP without HTTPS is medium risk
        if (port.port === 80 && !ports.some(p => p.port === 443)) {
          return true;
        }
        // Other medium risk ports
        return [21, 23, 25, 110, 143].includes(port.port);
      });
      
      if (riskyMediumPorts.length > 0) {
        riskyMediumPorts.forEach(port => {
          const service = getServiceName(port.port);
          if (port.port === 80 && !ports.some(p => p.port === 443)) {
            weaknesses.push(`HTTP (port 80) without HTTPS (port 443) - Traffic is not encrypted`);
          } else {
            weaknesses.push(`Port ${port.port} (${service}) exposed - Consider securing this service`);
          }
        });
      }
      
      // Check for sensitive directories
      const sensitiveDirs = directories.filter(dir => 
        dir.includes('admin') || 
        dir.includes('backup') || 
        dir.includes('config') ||
        dir.includes('.git') ||
        dir.includes('.env') ||
        dir.includes('phpinfo') ||
        dir.includes('test')
      );
      
      if (sensitiveDirs.length > 0) {
        sensitiveDirs.slice(0, 3).forEach(dir => {
          weaknesses.push(`Sensitive directory exposed: ${dir}`);
        });
      }
      
      // Check for too many open ports
      if (ports.length > 20) {
        weaknesses.push(`Excessive number of open ports (${ports.length}) - Increases attack surface`);
      }
      
      // Display weaknesses or "No weaknesses found"
      if (weaknesses.length === 0) {
        doc.fillColor('#48bb78')
           .fontSize(14)
           .text('No security weaknesses detected', 90, yPosition);
        
        // Add explanation for common ports
        const commonPorts = ports.filter(port => 
          getPortRiskLevel(port.port) === 'Low' || 
          port.port === 80 || 
          port.port === 443
        );
        
        if (commonPorts.length > 0) {
          yPosition += 40;
          doc.fillColor('#718096')
             .fontSize(11)
             .text(
               'Note: Common service ports (HTTP/HTTPS) are expected to be open for web applications. ' +
               'These are not considered security weaknesses unless misconfigured.',
               70, yPosition, { width: 480, align: 'left' }
             );
        }
        yPosition += 60;
      } else {
        weaknesses.forEach((weakness, i) => {
          doc.fillColor('#f56565')
             .fontSize(12)
             .text(`• ${weakness}`, 90, yPosition + (i * 25));
        });
        yPosition += weaknesses.length * 25 + 20;
      }
      
      // ========== SECTION 3: SECURITY RECOMMENDATIONS ==========
      doc.fillColor('#2d74da')
         .fontSize(16)
         .text('Security Recommendations', 70, yPosition);
      
      yPosition += 40;
      
      const recommendations = [];
      
      // Generate recommendations based on findings
      if (highRiskPorts.length > 0) {
        recommendations.push('Close or restrict access to high-risk ports (SSH, FTP, Telnet, RDP)');
      }
      
      if (ports.some(p => p.port === 80) && !ports.some(p => p.port === 443)) {
        recommendations.push('Implement HTTPS (SSL/TLS) to encrypt web traffic');
      }
      
      if (sensitiveDirs.length > 0) {
        recommendations.push('Remove or restrict access to sensitive directories');
      }
      
      if (ports.length > 10) {
        recommendations.push('Review and reduce the number of open ports');
      }
      
      // Add general recommendations if no specific ones
      if (recommendations.length === 0 && ports.length > 0) {
        recommendations.push('Regularly review and monitor open ports');
        recommendations.push('Keep services updated with security patches');
        recommendations.push('Implement a Web Application Firewall (WAF)');
      }
      
      recommendations.forEach((rec, i) => {
        doc.fillColor('#4a5568')
           .fontSize(12)
           .text(`• ${rec}`, 90, yPosition + (i * 25));
      });
      
      yPosition += recommendations.length * 25 + 30;
      
      // ========== SECTION 4: SUMMARY ==========
      doc.fillColor('#2d3748')
         .fontSize(16)
         .text('Summary', 70, yPosition);
      
      yPosition += 30;
      
      // Summary statistics
      const totalPorts = ports.length;
      const highRiskCount = highRiskPorts.length;
      const mediumRiskCount = mediumRiskPorts.length;
      const lowRiskCount = ports.filter(p => getPortRiskLevel(p.port) === 'Low').length;
      
      doc.fillColor('#4a5568')
         .fontSize(12)
         .text(`Total Open Ports: ${totalPorts}`, 90, yPosition);
      
      doc.fillColor('#f56565')
         .fontSize(12)
         .text(`High Risk Ports: ${highRiskCount}`, 90, yPosition + 20);
      
      doc.fillColor('#d69e2e')
         .fontSize(12)
         .text(`Medium Risk Ports: ${mediumRiskCount}`, 90, yPosition + 40);
      
      doc.fillColor('#48bb78')
         .fontSize(12)
         .text(`Low Risk Ports: ${lowRiskCount}`, 90, yPosition + 60);
      
      // Overall assessment
      yPosition += 90;
      let overallColor = '#48bb78';
      let overallMessage = 'Good Security Posture';
      
      if (highRiskCount > 0) {
        overallColor = '#f56565';
        overallMessage = 'Needs Immediate Attention';
      } else if (mediumRiskCount > 0) {
        overallColor = '#d69e2e';
        overallMessage = 'Needs Improvement';
      }
      
      doc.fillColor(overallColor)
         .fontSize(14)
         .text(`Overall Assessment: ${overallMessage}`, 70, yPosition);
      
      // ========== END DOCUMENT ==========
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}

// Helper functions
function getServiceName(portNumber) {
  const commonPorts = {
    80: 'HTTP', 443: 'HTTPS/SSL', 22: 'SSH', 21: 'FTP',
    25: 'SMTP', 53: 'DNS', 3306: 'MySQL', 3389: 'RDP',
    23: 'Telnet', 110: 'POP3', 143: 'IMAP', 445: 'SMB',
    8080: 'HTTP-Proxy', 8443: 'HTTPS-Alt', 27017: 'MongoDB',
    6379: 'Redis', 9200: 'Elasticsearch'
  };
  return commonPorts[portNumber] || `Service ${portNumber}`;
}

function getPortRiskLevel(portNumber) {
  // HIGH RISK: Services that should NEVER be publicly exposed
  const highRiskPorts = [
    22,    // SSH
    23,    // Telnet
    3389,  // RDP
    445,   // SMB
    1433,  // MSSQL
    1521,  // Oracle DB
    5432,  // PostgreSQL
    27017, // MongoDB
    6379,  // Redis
    9200   // Elasticsearch
  ];
  
  // MEDIUM RISK: Services that need proper configuration
  const mediumRiskPorts = [
    21,    // FTP
    25,    // SMTP
    110,   // POP3
    143,   // IMAP
    161,   // SNMP
    389,   // LDAP
    587,   // SMTP Submission
    993,   // IMAPS
    995,   // POP3S
    3306,  // MySQL
    5900   // VNC
  ];
  
  // LOW RISK: Common web/service ports (expected to be open)
  const lowRiskPorts = [
    80,    // HTTP
    443,   // HTTPS
    53,    // DNS
    123,   // NTP
    8080,  // HTTP Alt
    8443,  // HTTPS Alt
    3000,  // Node.js
    5000   // Flask/Debug
  ];
  
  if (highRiskPorts.includes(portNumber)) return 'High';
  if (mediumRiskPorts.includes(portNumber)) return 'Medium';
  if (lowRiskPorts.includes(portNumber)) return 'Low';
  return 'Medium'; // Default unknown ports to Medium risk
}

function getRiskColor(riskLevel) {
  const colors = {
    'High': '#f56565',
    'Medium': '#d69e2e',
    'Low': '#48bb78'
  };
  return colors[riskLevel] || '#718096';
}