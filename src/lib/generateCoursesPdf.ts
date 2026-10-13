import { jsPDF } from "jspdf";
import { Course } from "@/types/course";

export function generateCoursesPdf(courses: Course[]) {
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
  doc.text("Counsel India - Courses Directory", margin, 18);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Exported: ${new Date().toLocaleDateString()} | Total Records: ${courses.length}`,
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
  doc.text("Course Name", margin + 14, startY + 5.5);
  doc.text("Category", margin + 120, startY + 5.5);
  doc.text("Duration", margin + 170, startY + 5.5);
  doc.text("Fee", margin + 205, startY + 5.5);
  doc.text("Position", margin + 230, startY + 5.5);
  doc.text("Status", margin + 252, startY + 5.5);

  let currentY = startY + 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  courses.forEach((course, index) => {
    if (currentY > pageHeight - 15) {
      doc.addPage();
      currentY = 20;

      // Re-draw header on new page
      doc.setFillColor(9, 166, 74);
      doc.rect(margin, currentY, pageWidth - margin * 2, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("#ID", margin + 2, currentY + 5.5);
      doc.text("Course Name", margin + 14, currentY + 5.5);
      doc.text("Category", margin + 120, currentY + 5.5);
      doc.text("Duration", margin + 170, currentY + 5.5);
      doc.text("Fee", margin + 205, currentY + 5.5);
      doc.text("Position", margin + 230, currentY + 5.5);
      doc.text("Status", margin + 252, currentY + 5.5);
      currentY += 8;
      doc.setFont("helvetica", "normal");
    }

    // Row alternating background
    if (index % 2 === 1) {
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, currentY, pageWidth - margin * 2, 7, "F");
    }

    doc.setTextColor(30, 30, 30);
    const sNo = index + 1;
    const name = (course.name || "-").slice(0, 55);
    const category = (course.category || "-").slice(0, 24);
    const duration = (course.listDuration || course.duration || "-").slice(0, 18);
    const fee = course.totalDiscountFee ? `₹${course.totalDiscountFee}` : "-";
    const pos = String(course.position || index + 1);
    const status = course.status || "Active";

    doc.text(String(sNo), margin + 2, currentY + 4.8);
    doc.text(name, margin + 14, currentY + 4.8);
    doc.text(category, margin + 120, currentY + 4.8);
    doc.text(duration, margin + 170, currentY + 4.8);
    doc.text(fee, margin + 205, currentY + 4.8);
    doc.text(pos, margin + 230, currentY + 4.8);
    doc.text(status, margin + 252, currentY + 4.8);

    currentY += 7;
  });

  doc.save(`CounselIndia_Courses_${new Date().toISOString().slice(0, 10)}.pdf`);
}
