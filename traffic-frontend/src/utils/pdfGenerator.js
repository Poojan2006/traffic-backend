import jsPDF from 'jspdf';

export const generateChallanPDF = (violation) => {
    const doc = new jsPDF();
    
    // Header styling
    doc.setFillColor(30, 41, 59); // Dark slate header
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("TRIVO", 20, 23);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("OFFICIAL E-CHALLAN", 125, 23);
    
    // Violation Details Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Challan Summary", 20, 55);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const challanNo = `TRV-${(violation.id || 0).toString().padStart(6, '0')}`;
    doc.text(`Challan No: ${challanNo}`, 20, 65);
    doc.text(`Date Issued: ${new Date(violation.createdAt).toLocaleDateString()}`, 20, 72);
    doc.text(`Status: ${violation.status}`, 20, 79);
    
    // Vehicle Info Section
    doc.setFont("helvetica", "bold");
    doc.text("Vehicle & Location", 110, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`Vehicle Reg. No: ${violation.vehicleNo || 'N/A'}`, 110, 65);
    
    const maxLocWidth = 80;
    const splitLoc = doc.splitTextToSize(`Location: ${violation.location || 'Not Specified'}`, maxLocWidth);
    doc.text(splitLoc, 110, 72);
    
    // Line separator
    const locHeight = splitLoc.length * 5;
    const separatorY = Math.max(85, 72 + locHeight);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, separatorY, 190, separatorY);

    // Offense Description
    doc.setFont("helvetica", "bold");
    doc.text("Offense Details", 20, separatorY + 15);
    doc.setFont("helvetica", "normal");
    
    const splitDesc = doc.splitTextToSize(violation.description, 170);
    doc.text(splitDesc, 20, separatorY + 25);
    
    const descHeight = splitDesc.length * 5;
    
    // Fine amount box
    const fineY = separatorY + 25 + descHeight + 10;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, fineY, 170, 25, 'FD');
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Total Fine Amount:", 30, fineY + 16);
    
    doc.setTextColor(220, 38, 38); // Red text
    doc.setFontSize(16);
    doc.text(`Rs. ${violation.fineAmount || 0} /-`, 140, fineY + 16);
    
    // Footer / Disclaimer
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("Note: Evidence photo and officer verification details are securely stored locally.", 20, fineY + 40);
    doc.text("This is a computer-generated document and requires no physical signature.", 20, fineY + 45);
    
    // Save the PDF
    doc.save(`Challan_${challanNo}.pdf`);
};
