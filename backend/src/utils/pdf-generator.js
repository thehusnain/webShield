import PDFDocument from 'pdfkit';

export async function generateScanReport(scanData) {
    try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];
        
        return new Promise((resolve, reject) => {
            try {
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(chunks);
                    resolve(pdfBuffer);
                });
                doc.on('error', reject);
                
                // ==== PROFESSIONAL REPORT ====
                
                // 1. COVER PAGE
                doc.rect(0, 0, doc.page.width, doc.page.height)
                   .fill('#2c3e50');
                
                doc.fillColor('white')
                   .fontSize(36)
                   .text('WebShield', 50, 200, { align: 'center' });
                
                doc.fontSize(24)
                   .text('Security Assessment Report', 50, 250, { align: 'center' });
                
                doc.fontSize(14)
                   .text(`For: ${scanData.targetUrl}`, 50, 350, { align: 'center' })
                   .text(`Date: ${new Date(scanData.createdAt).toLocaleDateString()}`, 50, 375, { align: 'center' });
                
                doc.addPage();
                
                // 2. SECURITY SCORE
                doc.fillColor('#2c3e50')
                   .fontSize(20)
                   .text('Security Assessment Summary', { underline: true })
                   .moveDown();
                // Calculate security score
                const securityScore = calculateSecurityScore(scanData);
                
                // Show grade
                doc.fontSize(48)
                   .fillColor(getGradeColor(securityScore.grade))
                   .text(securityScore.grade, { align: 'center' });
                
                doc.fontSize(16)
                   .fillColor('black')
                   .text(`Score: ${securityScore.score}/100`, { align: 'center' })
                   .text(`${securityScore.message}`, { align: 'center' })
                   .moveDown(2);
                
                // 3. DETAILED FINDINGS
                doc.fillColor('#2c3e50')
                   .fontSize(18)
                   .text('Detailed Analysis', { underline: true })
                   .moveDown();
                
                // NMAP ANALYSIS
                if (scanData.results?.nmap?.openPorts?.length > 0) {
                    doc.fontSize(16)
                       .fillColor('#e74c3c')
                       .text('Network Security', { underline: true })
                       .moveDown();
                    
                    const ports = scanData.results.nmap.openPorts;
                    
                    // Analyze port security
                    const allowedPorts = [80, 443]; // Standard web ports
                    const dangerousPorts = [21, 22, 23, 25, 3389]; // Risky ports
                    
                    let securityAnalysis = "✅ Good: Only standard web ports are open.\n";
                    
                    ports.forEach(port => {
                        if (allowedPorts.includes(port.port)) {
                            doc.fontSize(12)
                               .fillColor('#27ae60')
                               .text(`✓ Port ${port.port} (${port.service}) - Normal for websites`);
                        } else if (dangerousPorts.includes(port.port)) {
                            doc.fontSize(12)
                               .fillColor('#c0392b')
                               .text(`✗ Port ${port.port} (${port.service}) - RISKY! Should be closed`);
                            securityAnalysis = "⚠️ Warning: Risky ports are open.\n";
                        } else {
                            doc.fontSize(12)
                               .fillColor('#f39c12')
                               .text(`• Port ${port.port} (${port.service}) - Review if needed`);
                        }
                    });
                    
                    doc.moveDown()
                       .fontSize(12)
                       .fillColor('black')
                       .text('Security Analysis:')
                       .text(securityAnalysis);
                    
                    doc.moveDown();
                }
                
                // DIRB/GOBUSTER ANALYSIS
                if (scanData.results?.directories?.length > 0) {
                    doc.fontSize(16)
                       .fillColor('#e67e22')
                       .text('Hidden Directories Analysis', { underline: true })
                       .moveDown();
                    
                    const sensitiveDirs = ['/admin', '/backup', '/config', '/database', '/sql', '/phpmyadmin'];
                    
                    scanData.results.directories.forEach(dir => {
                        if (sensitiveDirs.some(sd => dir.includes(sd))) {
                            doc.fontSize(12)
                               .fillColor('#c0392b')
                               .text(`✗ ${dir} - SENSITIVE! Should be protected or removed`);
                        } else {
                            doc.fontSize(12)
                               .fillColor('#f39c12')
                               .text(`• ${dir} - Review if needed`);
                        }
                    });
                    
                    doc.moveDown()
                       .fontSize(12)
                       .fillColor('black')
                       .text('Recommendation: Protect sensitive directories with authentication or remove them.');
                    
                    doc.moveDown();
                }
                
                // 4. RECOMMENDATIONS
                doc.fillColor('#2c3e50')
                   .fontSize(18)
                   .text('Action Items', { underline: true })
                   .moveDown();
                
                const recommendations = getRecommendations(scanData);
                recommendations.forEach((rec, index) => {
                    doc.fontSize(12)
                       .fillColor('black')
                       .text(`${index + 1}. ${rec.text}`, { 
                           bulletRadius: 3,
                           indent: 20,
                           continued: false
                       });
                });
                
                // 5. FOOTER
                doc.moveDown(2);
                doc.fontSize(10)
                   .fillColor('#7f8c8d')
                   .text('Generated by WebShield - Your Website Security Partner', { align: 'center' })
                   .text('Final Year Project - Govt AKNK Degree College', { align: 'center' });
                
                
                doc.end();
                
            } catch (error) {
                reject(error);
            }
        });
        
    } catch (error) {
        throw new Error(`PDF generation failed: ${error.message}`);
    }
}

// Helper function to calculate security score
function calculateSecurityScore(scanData) {
    let score = 100;
    let issues = [];
    
    // Deduct points for each vulnerability
    if (scanData.results?.nmap?.openPorts?.length > 2) {
        score -= 20;
        issues.push("Too many open ports");
    }
    
    if (scanData.results?.directories?.length > 0) {
        score -= 15;
        issues.push("Exposed directories");
    }
    
    if (scanData.results?.nikto?.length > 0) {
        score -= 25;
        issues.push("Web vulnerabilities found");
    }
    
    if (scanData.results?.ssl?.issues?.length > 0) {
        score -= 20;
        issues.push("SSL configuration issues");
    }
    
    // Determine grade
    let grade, message;
    if (score >= 90) {
        grade = "A+";
        message = "Excellent Security";
    } else if (score >= 80) {
        grade = "B";
        message = "Good Security";
    } else if (score >= 70) {
        grade = "C";
        message = "Moderate Security - Needs Improvement";
    } else if (score >= 60) {
        grade = "D";
        message = "Poor Security - Immediate Action Required";
    } else {
        grade = "F";
        message = "Critical Security Issues";
    }
    
    return { score, grade, message, issues };
}

// Helper function to get grade color
function getGradeColor(grade) {
    const colors = {
        'A+': '#27ae60', // Green
        'B': '#2ecc71',  // Light Green
        'C': '#f39c12',  // Orange
        'D': '#e67e22',  // Dark Orange
        'F': '#c0392b'   // Red
    };
    return colors[grade] || '#2c3e50';
}

// Helper function to get recommendations
function getRecommendations(scanData) {
    const recs = [];
    
    if (scanData.results?.nmap?.openPorts?.length > 2) {
        recs.push({
            priority: 'High',
            text: 'Close unnecessary ports in firewall configuration'
        });
    }
    
    if (scanData.results?.directories?.length > 0) {
        recs.push({
            priority: 'Medium',
            text: 'Protect sensitive directories with authentication'
        });
    }
    
    if (scanData.results?.nikto?.length > 0) {
        recs.push({
            priority: 'High',
            text: 'Fix web vulnerabilities identified in scan'
        });
    }
    
    // Default recommendations
    recs.push({
        priority: 'Low',
        text: 'Implement regular security scanning (weekly recommended)'
    });
    
    recs.push({
        priority: 'Medium', 
        text: 'Keep all software components updated to latest versions'
    });
    
    return recs.sort((a, b) => {
        const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}