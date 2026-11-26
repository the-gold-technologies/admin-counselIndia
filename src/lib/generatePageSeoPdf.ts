import { jsPDF } from "jspdf";

export interface PageSeoPdfRow {
  name: string;
  path: string;
  title: string;
  score: number;
  status: string; // "SEO set", "Not set", "Hidden"
}

const today = () =>
  new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

/** Exports the Page SEO list (as currently filtered) to an A4 PDF table — same layout as Blogs. */
export function generatePageSeoPdf(rows: PageSeoPdfRow[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 14;
  const pageWidth = 210;
  const pageHeight = 297;
  const contentWidth = pageWidth - margin * 2;

  const cols = [
    { label: "S.No", width: 12 },
    { label: "Page", width: 42 },
    { label: "Title shown in Google", width: 88 },
    { label: "Score", width: 14 },
    { label: "Status", width: 26 },
  ];
  const colX: number[] = [];
  cols.reduce((x, c) => {
    colX.push(x);
    return x + c.width;
  }, margin);

  let y = 16;

  const drawHeader = (first: boolean) => {
    if (first) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text("Page SEO", pageWidth / 2, y, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`${rows.length} pages · Exported ${today()}`, pageWidth / 2, y + 5, {
        align: "center",
      });
      y += 11;
    }
    doc.setFillColor(9, 166, 74);
    doc.rect(margin, y, contentWidth, 9, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    cols.forEach((c, i) => doc.text(c.label, colX[i] + 2, y + 6));
    y += 9;
  };

  drawHeader(true);

  rows.forEach((r, index) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const cells = [
      [String(index + 1)],
      doc.splitTextToSize(`${r.name}\n${r.path}`, cols[1].width - 4),
      doc.splitTextToSize(r.title || "-", cols[2].width - 4),
      [String(r.score)],
      [r.status],
    ] as string[][];
    const lines = Math.max(...cells.map((c) => c.length));
    const rowHeight = Math.max(9, lines * 3.6 + 4);

    if (y + rowHeight > pageHeight - 15) {
      doc.addPage();
      y = 14;
      drawHeader(false);
    }
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowHeight, "F");
    }
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    cells.forEach((cell, i) => {
      if (i === 4) {
        const [rr, gg, bb] =
          r.status === "SEO set"
            ? [9, 166, 74]
            : r.status === "Hidden"
              ? [225, 29, 72]
              : [180, 120, 0];
        doc.setTextColor(rr, gg, bb);
        doc.setFont("helvetica", "bold");
      } else if (i === 3) {
        const [rr, gg, bb] =
          r.score >= 80 ? [9, 166, 74] : r.score >= 50 ? [180, 120, 0] : [225, 29, 72];
        doc.setTextColor(rr, gg, bb);
        doc.setFont("helvetica", "bold");
      } else {
        doc.setTextColor(51, 65, 85);
        doc.setFont("helvetica", i === 1 ? "bold" : "normal");
      }
      doc.text(cell, colX[i] + 2, y + 5.5);
    });
    y += rowHeight;
  });

  doc.save(`counselindia_page_seo_${new Date().toISOString().slice(0, 10)}.pdf`);
}
