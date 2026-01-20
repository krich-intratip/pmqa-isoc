/**
 * Data Export Utilities
 * Export data to CSV format (Excel compatible)
 */

interface ExportColumn {
    header: string;
    key: string;
    width?: number;
}

interface ExportOptions {
    filename: string;
    sheetName?: string;
    columns: ExportColumn[];
    data: Record<string, any>[];
}

/**
 * Export data to CSV file (Excel compatible)
 */
export function exportToCSV({ filename, columns, data }: ExportOptions): void {
    // Create header row
    const headers = columns.map(col => `"${col.header}"`).join(',');

    // Create data rows
    const rows = data.map(row => {
        return columns.map(col => {
            const value = row[col.key];
            if (value === null || value === undefined) return '""';
            if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
            if (typeof value === 'number') return value.toString();
            if (value instanceof Date) return `"${value.toLocaleDateString('th-TH')}"`;
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',');
    });

    // Combine headers and rows
    const csv = [headers, ...rows].join('\n');

    // Add BOM for Thai characters in Excel
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;

    // Create blob and download
    const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export dashboard summary to CSV
 */
export function exportDashboardSummary(
    cycleName: string,
    stats: {
        evidenceCount: number;
        verifiedCount: number;
        kpiDataCount: number;
        sarContentsCount: number;
        risksCount: number;
        qaCount: number;
        strategyLinksCount: number;
    }
): void {
    const data = [
        { metric: 'รอบการประเมิน', value: cycleName, unit: '' },
        { metric: 'เอกสารหลักฐาน', value: stats.evidenceCount, unit: 'รายการ' },
        { metric: 'ผ่านการตรวจสอบ', value: stats.verifiedCount, unit: 'รายการ' },
        { metric: 'ข้อมูล KPI', value: stats.kpiDataCount, unit: 'รายการ' },
        { metric: 'เนื้อหา SAR', value: stats.sarContentsCount, unit: 'รายการ' },
        { metric: 'ความเสี่ยง', value: stats.risksCount, unit: 'รายการ' },
        { metric: 'คำถาม-คำตอบ', value: stats.qaCount, unit: 'รายการ' },
        { metric: 'เชื่อมโยงยุทธศาสตร์', value: stats.strategyLinksCount, unit: 'รายการ' },
    ];

    exportToCSV({
        filename: `PMQA_Dashboard_${cycleName}_${new Date().toISOString().split('T')[0]}`,
        columns: [
            { header: 'ตัวชี้วัด', key: 'metric' },
            { header: 'จำนวน', key: 'value' },
            { header: 'หน่วย', key: 'unit' },
        ],
        data,
    });
}

/**
 * Export evidence list to CSV
 */
export function exportEvidenceList(
    cycleName: string,
    evidence: Array<{
        code: string;
        name: string;
        category: number;
        subcategory?: string;
        verificationStatus: string;
        uploadedAt: Date;
    }>
): void {
    const statusMap: Record<string, string> = {
        pending: 'รอตรวจสอบ',
        verified: 'ผ่านการตรวจสอบ',
        rejected: 'ไม่ผ่าน',
    };

    const data = evidence.map(e => ({
        code: e.code,
        name: e.name,
        category: `หมวด ${e.category}`,
        subcategory: e.subcategory || '-',
        status: statusMap[e.verificationStatus] || e.verificationStatus,
        uploadedAt: e.uploadedAt,
    }));

    exportToCSV({
        filename: `PMQA_Evidence_${cycleName}_${new Date().toISOString().split('T')[0]}`,
        columns: [
            { header: 'รหัสหลักฐาน', key: 'code' },
            { header: 'ชื่อหลักฐาน', key: 'name' },
            { header: 'หมวด', key: 'category' },
            { header: 'หัวข้อย่อย', key: 'subcategory' },
            { header: 'สถานะ', key: 'status' },
            { header: 'วันที่อัปโหลด', key: 'uploadedAt' },
        ],
        data,
    });
}

/**
 * Export KPI data to CSV
 */
export function exportKPIData(
    cycleName: string,
    kpiData: Array<{
        kpiCode: string;
        kpiName: string;
        value: number;
        unit: string;
        period: string;
        updatedAt: Date;
    }>
): void {
    exportToCSV({
        filename: `PMQA_KPI_${cycleName}_${new Date().toISOString().split('T')[0]}`,
        columns: [
            { header: 'รหัส KPI', key: 'kpiCode' },
            { header: 'ชื่อ KPI', key: 'kpiName' },
            { header: 'ค่า', key: 'value' },
            { header: 'หน่วย', key: 'unit' },
            { header: 'ช่วงเวลา', key: 'period' },
            { header: 'อัปเดตล่าสุด', key: 'updatedAt' },
        ],
        data: kpiData,
    });
}

/**
 * Helper to download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export SAR content to HTML (for printing/PDF)
 */
export function exportSARToHTML(
    cycleName: string,
    unitName: string,
    sarContents: Array<{
        category: number;
        subcategory: string;
        title: string;
        content: string;
    }>
): void {
    const html = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>รายงานการประเมินตนเอง PMQA 4.0 - ${cycleName}</title>
    <style>
        body { font-family: 'TH Sarabun New', 'Sarabun', sans-serif; font-size: 16pt; line-height: 1.6; max-width: 210mm; margin: 0 auto; padding: 20mm; }
        h1 { text-align: center; color: #1e40af; }
        h2 { color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 5px; margin-top: 30px; }
        h3 { color: #1e40af; margin-top: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .unit-name { font-size: 18pt; color: #374151; }
        .cycle-name { font-size: 14pt; color: #6b7280; }
        .content { text-align: justify; }
        @media print { body { padding: 10mm; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>รายงานการประเมินตนเอง PMQA 4.0</h1>
        <div class="unit-name">${unitName}</div>
        <div class="cycle-name">รอบการประเมิน: ${cycleName}</div>
    </div>
    ${sarContents.map(sar => `
        <h2>หมวด ${sar.category}: ${sar.subcategory}</h2>
        <h3>${sar.title}</h3>
        <div class="content">${sar.content}</div>
    `).join('')}
    <div style="text-align: center; margin-top: 40px; color: #6b7280;">
        <p>สร้างโดยระบบ PMQA ISOC</p>
        <p>${new Date().toLocaleDateString('th-TH', { dateStyle: 'long' })}</p>
    </div>
</body>
</html>
`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    downloadBlob(blob, `SAR_${cycleName}_${new Date().toISOString().split('T')[0]}.html`);
}

/**
 * Export Dashboard with Charts to HTML (Beautiful Report)
 */
export function exportDashboardHTML(
    cycleName: string,
    unitName: string,
    stats: {
        evidenceCount: number;
        verifiedCount: number;
        kpiDataCount: number;
        sarContentsCount: number;
        risksCount: number;
        qaCount: number;
        strategyLinksCount: number;
        categoryProgress: number;
    },
    phaseProgress: Array<{
        phase: number;
        name: string;
        completion: number;
    }>
): void {
    const today = new Date().toLocaleDateString('th-TH', { dateStyle: 'long' });
    const progressPercent = stats.categoryProgress;

    // Calculate average phase progress
    const avgPhaseProgress = phaseProgress.length > 0
        ? Math.round(phaseProgress.reduce((sum, p) => sum + p.completion, 0) / phaseProgress.length)
        : 0;

    const html = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Report - ${cycleName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'TH Sarabun New', 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 16pt;
            line-height: 1.6;
            color: #1e293b;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 50px 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 36pt;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .header .subtitle {
            font-size: 20pt;
            opacity: 0.95;
        }
        .header .meta {
            margin-top: 20px;
            font-size: 14pt;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section-title {
            font-size: 24pt;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        .stat-card:hover {
            transform: translateY(-5px);
        }
        .stat-card .label {
            font-size: 14pt;
            color: #64748b;
            margin-bottom: 10px;
        }
        .stat-card .value {
            font-size: 36pt;
            font-weight: bold;
            color: #667eea;
        }
        .stat-card .unit {
            font-size: 14pt;
            color: #94a3b8;
            margin-left: 5px;
        }
        .progress-bar-container {
            background: #e2e8f0;
            border-radius: 999px;
            height: 30px;
            margin: 15px 0;
            overflow: hidden;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            border-radius: 999px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 15px;
            color: white;
            font-weight: bold;
            font-size: 14pt;
            transition: width 1s ease;
        }
        .chart-container {
            margin: 30px 0;
            padding: 30px;
            background: #f8fafc;
            border-radius: 15px;
            border: 1px solid #e2e8f0;
        }
        .bar-chart {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .bar-item {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .bar-label {
            min-width: 200px;
            font-size: 14pt;
            color: #475569;
        }
        .bar-wrapper {
            flex: 1;
            background: #e2e8f0;
            border-radius: 999px;
            height: 35px;
            overflow: hidden;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        }
        .bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981 0%, #059669 100%);
            border-radius: 999px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 15px;
            color: white;
            font-weight: bold;
            font-size: 13pt;
        }
        .footer {
            background: #f8fafc;
            padding: 30px 40px;
            text-align: center;
            color: #64748b;
            font-size: 13pt;
            border-top: 1px solid #e2e8f0;
        }
        .badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 999px;
            font-size: 13pt;
            font-weight: bold;
            margin: 5px;
        }
        .badge-success {
            background: #dcfce7;
            color: #166534;
        }
        .badge-warning {
            background: #fef3c7;
            color: #92400e;
        }
        .badge-info {
            background: #dbeafe;
            color: #1e40af;
        }
        @media print {
            body { padding: 0; background: white; }
            .container { box-shadow: none; }
            .stat-card:hover { transform: none; }
        }
        @page {
            size: A4;
            margin: 15mm;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 PMQA Dashboard Report</h1>
            <div class="subtitle">${unitName}</div>
            <div class="meta">
                <span class="badge badge-info">รอบการประเมิน: ${cycleName}</span>
                <span class="badge badge-success">ส่งออกวันที่: ${today}</span>
            </div>
        </div>

        <div class="content">
            <!-- Overall Progress -->
            <div class="section">
                <h2 class="section-title">📈 ความคืบหน้ารวม</h2>
                <div style="text-align: center; margin: 30px 0;">
                    <div style="font-size: 72pt; font-weight: bold; color: #667eea; margin-bottom: 10px;">
                        ${progressPercent}%
                    </div>
                    <div style="font-size: 18pt; color: #64748b;">
                        ความคืบหน้าหลักฐาน: ${stats.verifiedCount}/${stats.evidenceCount} ผ่านการตรวจสอบ
                    </div>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progressPercent}%;">
                        ${progressPercent}%
                    </div>
                </div>
            </div>

            <!-- Statistics Grid -->
            <div class="section">
                <h2 class="section-title">📑 สถิติโดยรวม</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="label">📄 เอกสารหลักฐาน</div>
                        <div class="value">${stats.evidenceCount}<span class="unit">รายการ</span></div>
                    </div>
                    <div class="stat-card">
                        <div class="label">✅ ผ่านการตรวจสอบ</div>
                        <div class="value">${stats.verifiedCount}<span class="unit">รายการ</span></div>
                    </div>
                    <div class="stat-card">
                        <div class="label">📊 ข้อมูล KPI</div>
                        <div class="value">${stats.kpiDataCount}<span class="unit">รายการ</span></div>
                    </div>
                    <div class="stat-card">
                        <div class="label">📝 เนื้อหา SAR</div>
                        <div class="value">${stats.sarContentsCount}<span class="unit">รายการ</span></div>
                    </div>
                    <div class="stat-card">
                        <div class="label">⚠️ ความเสี่ยง</div>
                        <div class="value">${stats.risksCount}<span class="unit">รายการ</span></div>
                    </div>
                    <div class="stat-card">
                        <div class="label">💬 คำถาม-คำตอบ</div>
                        <div class="value">${stats.qaCount}<span class="unit">รายการ</span></div>
                    </div>
                    <div class="stat-card">
                        <div class="label">🔗 เชื่อมโยงยุทธศาสตร์</div>
                        <div class="value">${stats.strategyLinksCount}<span class="unit">รายการ</span></div>
                    </div>
                    <div class="stat-card">
                        <div class="label">📊 ความคืบหน้า Phase เฉลี่ย</div>
                        <div class="value">${avgPhaseProgress}<span class="unit">%</span></div>
                    </div>
                </div>
            </div>

            <!-- Phase Progress Chart -->
            <div class="section">
                <h2 class="section-title">🎯 ความคืบหน้าแต่ละ Phase</h2>
                <div class="chart-container">
                    <div class="bar-chart">
                        ${phaseProgress.map(phase => `
                            <div class="bar-item">
                                <div class="bar-label">Phase ${phase.phase}: ${phase.name}</div>
                                <div class="bar-wrapper">
                                    <div class="bar-fill" style="width: ${phase.completion}%;">
                                        ${phase.completion}%
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            <p><strong>🤖 สร้างโดยระบบ PMQA ISOC</strong></p>
            <p>เอกสารนี้สร้างขึ้นอัตโนมัติจากข้อมูลใน Dashboard</p>
            <p style="margin-top: 10px; font-size: 12pt; color: #94a3b8;">
                สามารถพิมพ์เอกสารนี้ได้โดยกด Ctrl+P หรือ Cmd+P
            </p>
        </div>
    </div>
</body>
</html>
`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    downloadBlob(blob, `PMQA_Dashboard_Report_${cycleName}_${new Date().toISOString().split('T')[0]}.html`);
}
