import { jsPDF } from "jspdf";
import { AboutMemberItem } from "@/app/team/page";

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
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch {
    return String(dateStr);
  }
}

export function generateTeamPdf(members: AboutMemberItem[], filterLabel = "All Members") {
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
    sNo: 14,
    name: 45,
    designation: 55,
    category: 28,
    order: 16,
    status: 24,
  };

  const colX = {
    sNo: margin,
    name: margin + colWidths.sNo,
    designation: margin + colWidths.sNo + colWidths.name,
    category: margin + colWidths.sNo + colWidths.name + colWidths.designation,
    order: margin + colWidths.sNo + colWidths.name + colWidths.designation + colWidths.category,
    status:
      margin +
      colWidths.sNo +
      colWidths.name +
      colWidths.designation +
      colWidths.category +
      colWidths.order,
  };

  let y = 16;

  const drawHeader = (isFirstPage: boolean) => {
    if (isFirstPage) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text("Team & Advisors Directory", pageWidth / 2, y, { align: "center" });
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Filter: ${filterLabel} | Total: ${members.length} records | Generated: ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        y,
        { align: "center" }
      );
      y += 8;
    }

    // Header background bar (Counsel India Green)
    doc.setFillColor(9, 166, 74);
    doc.rect(margin, y, contentWidth, 9, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);

    doc.text("S.No", colX.sNo + colWidths.sNo / 2, y + 6, { align: "center" });
    doc.text("Member Name", colX.name + 3, y + 6);
    doc.text("Designation / Role", colX.designation + 3, y + 6);
    doc.text("Category", colX.category + 3, y + 6);
    doc.text("Order", colX.order + colWidths.order / 2, y + 6, { align: "center" });
    doc.text("Status", colX.status + colWidths.status / 2, y + 6, { align: "center" });

    y += 9;
  };

  drawHeader(true);

  members.forEach((item, index) => {
    const rowHeight = 11;

    if (y + rowHeight > pageHeight - margin - 10) {
      doc.addPage();
      y = 16;
      drawHeader(false);
    }

    // Alternate row background
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowHeight, "F");
    }

    // Border lines
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, rowHeight);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    // S.No
    doc.text(String(index + 1), colX.sNo + colWidths.sNo / 2, y + 7, { align: "center" });

    // Name
    doc.setFont("helvetica", "bold");
    const safeName = item.name.length > 24 ? item.name.substring(0, 23) + "..." : item.name;
    doc.text(safeName, colX.name + 3, y + 7);

    // Designation
    doc.setFont("helvetica", "normal");
    const safeDesig =
      item.designation.length > 30 ? item.designation.substring(0, 29) + "..." : item.designation;
    doc.text(safeDesig, colX.designation + 3, y + 7);

    // Category
    const catLabel =
      item.category === "core"
        ? "Core Team"
        : item.category === "advisor"
          ? "Advisor"
          : "Consultant";
    doc.text(catLabel, colX.category + 3, y + 7);

    // Order
    doc.text(String(item.order), colX.order + colWidths.order / 2, y + 7, { align: "center" });

    // Status
    const statusText = item.isActive ? "Active" : "Hidden";
    if (item.isActive) {
      doc.setTextColor(9, 166, 74);
    } else {
      doc.setTextColor(220, 38, 38);
    }
    doc.text(statusText, colX.status + colWidths.status / 2, y + 7, { align: "center" });

    y += rowHeight;
  });

  doc.save(`counselindia_team_advisors_${Date.now()}.pdf`);
}
