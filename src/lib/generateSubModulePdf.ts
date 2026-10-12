import { jsPDF } from "jspdf";
import { SubModuleItem } from "@/types/course";

export function generateSubModulePdf(
  items: SubModuleItem[],
  courseName: string,
  moduleTitle: string,
  slug: string
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 14;
  const pageWidth = 210;
  const pageHeight = 297;
  const usableWidth = pageWidth - margin * 2;

  // Header Title
  doc.setFontSize(16);
  doc.setTextColor(9, 166, 74);
  doc.text(`Counsel India - ${moduleTitle}`, margin, 18);

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(`Course: ${courseName}`, margin, 24);

  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text(
    `Exported: ${new Date().toLocaleDateString()} | Total Items: ${items.length}`,
    margin,
    29
  );

  // Table header bar
  const startY = 34;
  doc.setFillColor(31, 41, 55); // Dark header #1f2937 matching portal
  doc.rect(margin, startY, usableWidth, 8, "F");

  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");

  const colX = {
    id: margin + 2,
    type: margin + 14,
    title: margin + 45,
    pos: margin + 148,
    status: margin + 165,
  };

  doc.text("#ID", colX.id, startY + 5.5);
  doc.text("Type", colX.type, startY + 5.5);
  doc.text("Title / Description", colX.title, startY + 5.5);
  doc.text("Pos", colX.pos, startY + 5.5);
  doc.text("Status", colX.status, startY + 5.5);

  let currentY = startY + 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  items.forEach((item, index) => {
    const titleLines = doc.splitTextToSize(item.title || "-", usableWidth - 85);
    const rowHeight = Math.max(7, titleLines.length * 4.2 + 3);

    if (currentY + rowHeight > pageHeight - 15) {
      doc.addPage();
      currentY = 18;

      // Re-draw header on new page
      doc.setFillColor(31, 41, 55);
      doc.rect(margin, currentY, usableWidth, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("#ID", colX.id, currentY + 5.5);
      doc.text("Type", colX.type, currentY + 5.5);
      doc.text("Title / Description", colX.title, currentY + 5.5);
      doc.text("Pos", colX.pos, currentY + 5.5);
      doc.text("Status", colX.status, currentY + 5.5);
      currentY += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }

    // Row alternating background
    if (index % 2 === 1) {
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, currentY, usableWidth, rowHeight, "F");
    }

    doc.setTextColor(40, 40, 40);
    doc.text(String(index + 1), colX.id, currentY + 4.8);
    doc.text((item.type || "-").slice(0, 16), colX.type, currentY + 4.8);
    doc.text(titleLines, colX.title, currentY + 4.8);
    doc.text(String(item.position || index + 1), colX.pos, currentY + 4.8);
    doc.text(item.status || "Active", colX.status, currentY + 4.8);

    // subtle bottom line
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, currentY + rowHeight, margin + usableWidth, currentY + rowHeight);

    currentY += rowHeight;
  });

  doc.save(`${slug || "course"}_${moduleTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`);
}
