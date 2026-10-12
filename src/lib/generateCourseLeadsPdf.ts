import { jsPDF } from "jspdf";
import { CourseLeadItem } from "@/types/courseLead";

export function generateCourseLeadsPdf(leads: CourseLeadItem[]) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const margin = 12;
  const pageWidth = 297;
  const pageHeight = 210;

  // Header Title
  doc.setFontSize(18);
  doc.setTextColor(9, 166, 74);
  doc.text("Counsel India - Course Leads Directory", margin, 18);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Exported: ${new Date().toLocaleDateString()} | Total Records: ${leads.length}`,
    margin,
    25
  );

  // Table header bar
  const startY = 32;
  doc.setFillColor(9, 166, 74);
  doc.rect(margin, startY, pageWidth - margin * 2, 8, "F");

  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");

  doc.text("#ID", margin + 2, startY + 5.5);
  doc.text("Name", margin + 14, startY + 5.5);
  doc.text("Email", margin + 65, startY + 5.5);
  doc.text("Mobile", margin + 125, startY + 5.5);
  doc.text("Course Name", margin + 160, startY + 5.5);
  doc.text("Status", margin + 235, startY + 5.5);
  doc.text("Added On", margin + 255, startY + 5.5);

  let currentY = startY + 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  leads.forEach((lead, index) => {
    if (currentY > pageHeight - 15) {
      doc.addPage();
      currentY = 20;

      // Re-draw header on new page
      doc.setFillColor(9, 166, 74);
      doc.rect(margin, currentY, pageWidth - margin * 2, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("#ID", margin + 2, currentY + 5.5);
      doc.text("Name", margin + 14, currentY + 5.5);
      doc.text("Email", margin + 65, currentY + 5.5);
      doc.text("Mobile", margin + 125, currentY + 5.5);
      doc.text("Course Name", margin + 160, currentY + 5.5);
      doc.text("Status", margin + 235, currentY + 5.5);
      doc.text("Added On", margin + 255, currentY + 5.5);
      currentY += 8;
      doc.setFont("helvetica", "normal");
    }

    // Row alternating background
    if (index % 2 === 1) {
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, currentY, pageWidth - margin * 2, 7, "F");
    }

    doc.setTextColor(30, 30, 30);
    doc.text(String(lead.sNo || index + 1), margin + 2, currentY + 4.8);
    doc.text((lead.name || "-").slice(0, 24), margin + 14, currentY + 4.8);
    doc.text((lead.email || "-").slice(0, 30), margin + 65, currentY + 4.8);
    doc.text(lead.mobile || "-", margin + 125, currentY + 4.8);
    doc.text((lead.courseName || "-").slice(0, 40), margin + 160, currentY + 4.8);
    doc.text(lead.status || "New", margin + 235, currentY + 4.8);
    doc.text(lead.addedOn || "-", margin + 255, currentY + 4.8);

    currentY += 7;
  });

  doc.save(`Course_Leads_${new Date().toISOString().slice(0, 10)}.pdf`);
}
