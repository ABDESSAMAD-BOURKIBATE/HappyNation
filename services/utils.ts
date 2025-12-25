export const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'Happynation');

    try {
        const response = await fetch('https://api.cloudinary.com/v1_1/di3f7td92/image/upload', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Upload failed:', error);
        return null;
    }
};

// Generate Comprehensive Professional Report
export const generateComprehensivePDF = (historyData: any[], userProfile: any, currentResult: any, reportType: 'Daily' | 'Weekly' | 'Monthly' = 'Daily') => {
    // 1. Filter Data based on Report Type
    const now = new Date();
    let filteredHistory = [currentResult].filter(x => x); // Default to current only
    let dateLabel = now.toLocaleDateString();

    if (reportType === 'Weekly') {
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
        filteredHistory = historyData.filter(h => new Date(h.date) >= sevenDaysAgo);
        dateLabel = `Last 7 Days (Ending ${new Date().toLocaleDateString()})`;
    } else if (reportType === 'Monthly') {
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        filteredHistory = historyData.filter(h => new Date(h.date) >= thirtyDaysAgo);
        dateLabel = `Last 30 Days (Ending ${new Date().toLocaleDateString()})`;
    } else {
        // Daily: Just ensure we have the specific result or the latest one
        filteredHistory = currentResult ? [currentResult] : (historyData.length > 0 ? [historyData[historyData.length - 1]] : []);
    }

    // 2. Calculate Aggregates
    const count = filteredHistory.length;
    const avgScore = count > 0 ? Math.round(filteredHistory.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0) / count) : 0;

    // Determine dominant risk for aggregator
    const risks = filteredHistory.map(r => r.risk);
    const riskCounts = risks.reduce((acc: any, curr: string) => { acc[curr] = (acc[curr] || 0) + 1; return acc; }, {});
    const dominantRisk = Object.keys(riskCounts).reduce((a, b) => riskCounts[a] > riskCounts[b] ? a : b, 'Low');

    // Use current result for specific metrics/recs if Daily, otherwise use averages or latest for Monthly/Weekly
    const displayScore = reportType === 'Daily' ? (currentResult?.score || 0) : avgScore;
    const displayRisk = reportType === 'Daily' ? (currentResult?.risk || 'N/A') : dominantRisk;

    // QR Code Data
    const qrData = encodeURIComponent(`Employee: ${userProfile.name}\nID: ${userProfile.id}\nRole: ${userProfile.role}\nLatest Score: ${displayScore}\nRisk: ${displayRisk}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;

    const printWindow = window.open('', '_blank', 'width=1200,height=900,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    if (!printWindow) {
        alert('Please allow pop-ups to generate the report.');
        return;
    }

    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${reportType} Wellness Report - ${userProfile.name}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Inter:wght@400;500;600&display=swap');
                
                body { 
                    font-family: 'Inter', sans-serif; 
                    background: #f8fafc; 
                    color: #0f172a; 
                    -webkit-print-color-adjust: exact; 
                    margin: 0;
                    padding: 40px;
                }
                .page-container {
                    max-width: 900px;
                    margin: 0 auto;
                    background: white;
                    box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.1);
                    border-radius: 24px;
                    overflow: hidden;
                }
                
                /* Header */
                .header-bg {
                    background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
                    color: white;
                    padding: 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .brand h1 { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 32px; margin: 0; letter-spacing: -0.5px; }
                .brand p { opacity: 0.8; margin: 5px 0 0; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; }
                .report-meta { text-align: right; }
                .report-meta h2 { font-size: 18px; font-weight: 600; margin: 0; opacity: 0.9; }
                .report-meta p { opacity: 0.7; margin: 5px 0 0; font-size: 14px; }
                .badge { background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; display: inline-block; }

                /* Content Padding */
                .content { padding: 40px; }

                .top-row { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; }
                
                /* QR Section */
                .qr-section {
                    text-align: right;
                    background: #f8fafc;
                    padding: 15px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: fit-content;
                    margin-left: auto;
                }
                .qr-section img { width: 100px; height: 100px; mix-blend-mode: multiply; }
                .qr-label { font-size: 10px; color: #64748b; font-weight: 600; margin-top: 8px; text-transform: uppercase; }

                /* Executive Summary Section */
                .section-title {
                    font-family: 'Outfit', sans-serif;
                    font-size: 20px;
                    font-weight: 800;
                    color: #1e293b;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .section-title::before {
                    content: '';
                    display: block;
                    width: 6px;
                    height: 24px;
                    background: #4f46e5;
                    border-radius: 4px;
                }

                .summary-card {
                    display: flex;
                    gap: 30px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    padding: 30px;
                    margin-bottom: 40px;
                    flex-grow: 1;
                }
                .score-circle {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    border: 8px solid ${displayScore >= 70 ? '#10b981' : displayScore >= 40 ? '#f59e0b' : '#ef4444'};
                    flex-shrink: 0;
                }
                .score-num { font-size: 36px; font-weight: 800; font-family: 'Outfit', sans-serif; color: #0f172a; line-height: 1; }
                .score-label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: 4px; }
                
                .summary-text h3 { margin: 0 0 10px; color: #0f172a; font-size: 18px; font-weight: 700; }
                .summary-text p { margin: 0; color: #475569; line-height: 1.6; font-size: 15px; }

                /* Detailed AI Analysis */
                .ai-section {
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    border-radius: 20px;
                    padding: 30px;
                    margin-bottom: 40px;
                }
                .ai-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
                .ai-badge { background: #2563eb; color: white; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 99px; }
                
                .recommendation-list { list-style: none; padding: 0; margin: 0; }
                .rec-item {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 16px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #dbeafe;
                }
                .rec-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
                .rec-num {
                    background: white;
                    color: #2563eb;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 12px;
                    flex-shrink: 0;
                    border: 2px solid #bfdbfe;
                }
                .rec-content strong { display: block; color: #1e3a8a; font-size: 15px; margin-bottom: 4px; }
                .rec-content p { margin: 0; color: #3b82f6; font-size: 14px; line-height: 1.5; }

                /* Footer */
                .footer {
                    background: #f8fafc;
                    padding: 30px 40px;
                    border-top: 1px solid #e2e8f0;
                    text-align: center;
                    font-size: 12px;
                    color: #94a3b8;
                }

                /* Print Button */
                .floating-btn {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    background: #0f172a;
                    color: white;
                    padding: 16px 32px;
                    border-radius: 99px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    z-index: 1000;
                }
                @media print {
                    body { padding: 0; background: white; }
                    .page-container { box-shadow: none; border: none; border-radius: 0; max-width: 100%; }
                    .floating-btn { display: none; }
                }
            </style>
        </head>
        <body>
            <button class="floating-btn" onclick="window.print()">Download PDF Report</button>
            
            <div class="page-container">
                <div class="header-bg">
                    <div class="brand">
                        <span class="badge">${reportType} Report</span>
                        <h1>HappyNation</h1>
                        <p>Advanced Diagnostics</p>
                    </div>
                    <div class="report-meta">
                        <h2>${userProfile.name}</h2>
                        <p>${dateLabel}</p>
                    </div>
                </div>

                <div class="content">
                    <div class="top-row">
                        <div style="flex-grow: 1; margin-right: 30px;">
                            <div class="section-title">Executive Summary</div>
                            <div class="summary-card" style="margin-bottom: 0;">
                                <div class="score-circle">
                                    <span class="score-num">${displayScore}</span>
                                    <span class="score-label">Avg. Score</span>
                                </div>
                                <div class="summary-text">
                                    <h3>${displayRisk} Risk Trend</h3>
                                    <p>${reportType === 'Daily' ? (currentResult?.summary || 'Daily analysis complete.') : `This ${reportType.toLowerCase()} report aggregates ${count} assessments. The dominant risk factor observed is ${displayRisk}.`}</p>
                                </div>
                            </div>
                        </div>
                        <div class="qr-section">
                            <img src="${qrUrl}" alt="Employee QR" />
                            <span class="qr-label">Scan for Profile</span>
                        </div>
                    </div>

                    ${reportType === 'Daily' ? `
                    <div class="ai-section">
                        <div class="ai-header">
                            <span class="ai-badge">AI POWERED</span>
                            <div class="section-title" style="margin: 0; font-size: 18px;">Strategic Recommendations</div>
                        </div>
                        <ul class="recommendation-list">
                            ${currentResult?.recommendations?.map((rec: string, i: number) => `
                                <li class="rec-item">
                                    <div class="rec-num">${i + 1}</div>
                                    <div class="rec-content">
                                        <strong>Action Step ${i + 1}</strong>
                                        <p>${rec}</p>
                                    </div>
                                </li>
                            `).join('') || '<li class="rec-item"><div class="rec-content"><p>No specific recommendations available.</p></div></li>'}
                        </ul>
                    </div>
                    ` : ''}
                    
                    <div class="section-title" style="margin-top: 40px;">Historical Data Points</div>
                    <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
                        <thead>
                            <tr style="background:#f1f5f9; text-align:left;">
                                <th style="padding:12px; border-radius:8px 0 0 8px;">Date</th>
                                <th style="padding:12px;">Score</th>
                                <th style="padding:12px; border-radius:0 8px 8px 0;">Risk</th>
                            </tr>
                        </thead>
                        <tbody>
                             ${filteredHistory.slice(0, 10).map(record => `
                                <tr>
                                    <td style="padding:12px; border-bottom:1px solid #e2e8f0; font-size:14px; color:#475569;">
                                        ${new Date(record.date).toLocaleDateString()}
                                    </td>
                                    <td style="padding:12px; border-bottom:1px solid #e2e8f0; font-weight:600;">${record.score}</td>
                                    <td style="padding:12px; border-bottom:1px solid #e2e8f0; font-size:13px;">${record.risk}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                     CONFIDENTIAL • Generated by HappyNation AI System • ${userProfile.id || 'ID N/A'}
                </div>
            </div>

            <script>
                window.onload = function() { setTimeout(function() { window.print(); }, 800); }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
};
