import { jsPDF } from "jspdf";
import type { BlogItem } from "@/components/blogs/BlogForm";

export function formatBlogDate(d?: string | Date | null): string {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/** Exports the given blog list (as currently filtered) to an A4 PDF table. */
export function generateBlogsPdf(blogs: BlogItem[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 14;
  const pageWidth = 210;
  const pageHeight = 297;
  const contentWidth = pageWidth - margin * 2;

  const cols = [
    { key: "sno", label: "S.No", width: 12 },
    { key: "title", label: "Title", width: 74 },
    { key: "author", label: "Author", width: 30 },
    { key: "category", label: "Category", width: 30 },
    { key: "date", label: "Published", width: 22 },
    { key: "status", label: "Status", width: 14 },
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
      doc.text("Blogs", pageWidth / 2, y, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `${blogs.length} posts · Exported ${formatBlogDate(new Date())}`,
        pageWidth / 2,
        y + 5,
        { align: "center" }
      );
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

  blogs.forEach((b, index) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const cells = [
      [String(index + 1)],
      doc.splitTextToSize(b.title || "-", cols[1].width - 4),
      doc.splitTextToSize(b.authorName || "-", cols[2].width - 4),
      doc.splitTextToSize(b.category || "-", cols[3].width - 4),
      [formatBlogDate(b.publishedAt)],
      [b.status || "-"],
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
      if (i === 5) {
        const published = cell[0] === "Published";
        doc.setTextColor(published ? 9 : 180, published ? 166 : 120, published ? 74 : 0);
        doc.setFont("helvetica", "bold");
      } else {
        doc.setTextColor(51, 65, 85);
        doc.setFont("helvetica", i === 1 ? "bold" : "normal");
      }
      doc.text(cell, colX[i] + 2, y + 5.5);
    });
    y += rowHeight;
  });

  doc.save(`counselindia_blogs_${new Date().toISOString().slice(0, 10)}.pdf`);
}
