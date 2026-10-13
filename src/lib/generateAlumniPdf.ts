import { jsPDF } from "jspdf";
import { AlumniItem } from "@/components/alumni/AlumniTable";

function formatPdfDate(dateStr?: string | Date | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return String(dateStr);
  }
}

export function generateAlumniPdf(alumni: AlumniItem[]) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 14;
  const pageWidth = 210;
  const pageHeight = 297;
  const contentWidth = pageWidth - margin * 2; // 182mm

  const colWidths = {
    sNo: 12,
    details: 114,
    online: 20,
    status: 18,
    action: 18,
  };

  const colX = {
    sNo: margin,
    details: margin + colWidths.sNo,
    online: margin + colWidths.sNo + colWidths.details,
    status: margin + colWidths.sNo + colWidths.details + colWidths.online,
    action:
      margin +
      colWidths.sNo +
      colWidths.details +
      colWidths.online +
      colWidths.status,
  };

  let y = 16;

  const drawHeader = (isFirstPage: boolean) => {
    if (isFirstPage) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text("Exported data", pageWidth / 2, y, { align: "center" });
      y += 8;
    }

    // Header background bar (Navy Blue matching live site)
    doc.setFillColor(41, 67, 92);
    doc.rect(margin, y, contentWidth, 10, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);

    doc.text("S.No", colX.sNo + colWidths.sNo / 2, y + 6.5, {
      align: "center",
    });
    doc.text("Name & Details", colX.details + 2, y + 6.5);
    doc.text("Online\nStatus", colX.online + 2, y + 4.2);
    doc.text("Status", colX.status + 2, y + 6.5);
    doc.text("Action", colX.action + 2, y + 6.5);

    y += 10;
  };

  drawHeader(true);

  alumni.forEach((item, index) => {
    const sNumber = String(index + 1);
    const addedOn = formatPdfDate(item.createdAt);
    const updatedOn = formatPdfDate(item.updatedAt);
    const isApprovedStr = item.isApproved ? "Yes" : "No";

    // Estimate row height
    const rowHeight = 24;

    // Check page break
    if (y + rowHeight > pageHeight - 15) {
      doc.addPage();
      y = 14;
      drawHeader(false);
    }

    // Zebra row background
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, y, contentWidth, rowHeight, "F");
    }

    // Border line bottom
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    // S.No
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(sNumber, colX.sNo + colWidths.sNo / 2, y + 6, { align: "center" });

    // Name & Details multi-line content matching live PDF
    let lineY = y + 4.5;
    doc.setFont("helvetica", "bold");
    doc.text(`Name:${item.name}`, colX.details + 2, lineY);

    lineY += 4;
    doc.setFont("helvetica", "normal");
    doc.text(`Email:${item.email}`, colX.details + 2, lineY);

    lineY += 4;
    doc.text(`Mobile:${item.mobile}`, colX.details + 2, lineY);

    lineY += 4;
    doc.text(`Added On:${addedOn}`, colX.details + 2, lineY);
    doc.text(`Updated On:${updatedOn}`, colX.details + 58, lineY);

    lineY += 4;
    doc.text(`Is Approved: ${isApprovedStr}`, colX.details + 58, lineY);

    // Online Status column
    doc.text("Online:", colX.online + 2, y + 5);

    // Status column
    doc.text(item.status || "Active", colX.status + 2, y + 5);

    // Action column is empty in live export

    y += rowHeight;
  });

  // Save the PDF
  doc.save(`counselindia_alumni_exported_data_${Date.now()}.pdf`);
}
