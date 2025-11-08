import jsPDF from 'jspdf';
// Import autoTable plugin if available
try {
    // @ts-ignore
    import('jspdf-autotable').catch(() => {
        console.warn('jspdf-autotable not installed. PDF table export may not work.');
    });
}
catch (e) {
    // Plugin not available
}
/**
 * Convert data to CSV format and trigger download
 */
export const exportToCSV = (data, filename, headers) => {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }
    // Get headers from first object if not provided
    const csvHeaders = headers || Object.keys(data[0]);
    // Create CSV content
    const csvContent = [
        csvHeaders.join(','), // Header row
        ...data.map(row => csvHeaders.map(header => {
            const value = row[header];
            // Handle values that contain commas or quotes
            if (value === null || value === undefined)
                return '';
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(','))
    ].join('\n');
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
/**
 * Export data to PDF format
 */
export const exportToPDF = (data, filename, title, headers, columnStyles) => {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }
    const doc = new jsPDF();
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    // Get headers from first object if not provided
    const pdfHeaders = headers || Object.keys(data[0]);
    // Prepare table data
    const tableData = data.map(row => pdfHeaders.map(header => {
        const value = row[header];
        return value === null || value === undefined ? '' : String(value);
    }));
    // Add table
    doc.autoTable({
        head: [pdfHeaders],
        body: tableData,
        startY: 35,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        columnStyles: columnStyles || {},
        margin: { top: 35 },
    });
    // Save PDF
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};
/**
 * Export chart data to CSV
 */
export const exportChartToCSV = (chartData, filename, dataKeys) => {
    if (!chartData || chartData.length === 0) {
        console.warn('No chart data to export');
        return;
    }
    const headers = Object.keys(chartData[0]);
    exportToCSV(chartData, filename, headers);
};
/**
 * Format number as currency
 */
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};
/**
 * Format date for display
 */
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};
/**
 * Format date and time for display
 */
export const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
/**
 * Export user report to PDF
 */
export const exportUserReportToPDF = (reportData) => {
    const doc = new jsPDF();
    // Title
    doc.setFontSize(20);
    doc.text('User Report', 14, 22);
    // Date range
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    // Summary statistics
    doc.setFontSize(14);
    doc.text('Summary', 14, 45);
    doc.setFontSize(10);
    doc.text(`Total Users: ${reportData.totalUsers}`, 20, 55);
    doc.text(`Active Users: ${reportData.activeUsers}`, 20, 62);
    doc.text(`Inactive Users: ${reportData.inactiveUsers}`, 20, 69);
    doc.text(`New Registrations: ${reportData.newRegistrations}`, 20, 76);
    // Users by role table
    if (reportData.usersByRole && reportData.usersByRole.length > 0) {
        doc.setFontSize(14);
        doc.text('Users by Role', 14, 90);
        doc.autoTable({
            head: [['Role', 'Count']],
            body: reportData.usersByRole.map((item) => [item.role, item.count]),
            startY: 95,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [59, 130, 246] },
        });
    }
    doc.save(`user_report_${new Date().toISOString().split('T')[0]}.pdf`);
};
/**
 * Export revenue report to PDF
 */
export const exportRevenueReportToPDF = (reportData) => {
    const doc = new jsPDF();
    // Title
    doc.setFontSize(20);
    doc.text('Revenue Report', 14, 22);
    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 14, 45);
    doc.setFontSize(10);
    doc.text(`Total Revenue: ${formatCurrency(reportData.totalRevenue)}`, 20, 55);
    doc.text(`Total Payouts: ${formatCurrency(reportData.totalPayouts)}`, 20, 62);
    doc.text(`Total Commissions: ${formatCurrency(reportData.totalCommissions)}`, 20, 69);
    doc.text(`Pending Payouts: ${formatCurrency(reportData.pendingPayouts)}`, 20, 76);
    // Monthly revenue table
    if (reportData.revenueByMonth && reportData.revenueByMonth.length > 0) {
        doc.setFontSize(14);
        doc.text('Monthly Revenue Breakdown', 14, 90);
        doc.autoTable({
            head: [['Month', 'Revenue', 'Payouts', 'Commissions']],
            body: reportData.revenueByMonth.map((item) => [
                item.month,
                formatCurrency(item.revenue),
                formatCurrency(item.payouts),
                formatCurrency(item.commissions),
            ]),
            startY: 95,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [59, 130, 246] },
        });
    }
    doc.save(`revenue_report_${new Date().toISOString().split('T')[0]}.pdf`);
};
