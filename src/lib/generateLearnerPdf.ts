import { jsPDF } from "jspdf";

export function downloadLearnerPDF(learner: any) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const p = learner.personalDetails || {};
  const addr = learner.address || {};
  const expectations =
    Array.isArray(learner.courseExpectations) && learner.courseExpectations.length > 0
      ? learner.courseExpectations
      : [
          "Start",
          "Creating social impact & give it back to the society",
          "Promotion / Appraisal in existing role",
          "Job/ Placement",
          "Improve your own capability of handling life situations.",
          "Upskilling",
        ];

  const education = Array.isArray(learner.educationHistory) ? learner.educationHistory : [];

  const leftMargin = 15;
  const contentWidth = 180;
  const rightMargin = leftMargin + contentWidth;

  // PAGE 1
  let y = 18;

  // Title: Learner Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text("Learner Details", leftMargin, y);

  y += 10;
  doc.setFontSize(10.5);
  doc.text("Personal Details", leftMargin, y);

  y += 4;
  const personalFields = [
    ["Full Name", learner.name || ""],
    ["Mobile", learner.mobile || ""],
    ["Email", learner.email || ""],
    ["DOB", p.dob || ""],
    ["Age", String(p.age || "")],
    ["Academic counselor name", learner.academicCounselor || ""],
    ["Gender", p.gender || ""],
    ["Marital Status", p.maritalStatus || ""],
    ["Nationality", p.nationality || "Indian"],
    ["Aadhar Number", p.aadharNumber || ""],
    ["Pan Number", p.panNumber || ""],
    ["Category", p.category || "General"],
    ["Father's Name", p.fatherName || ""],
    ["Father's Mobile", p.fatherMobile || ""],
    ["Father's Email", p.fatherEmail || ""],
    ["Mother's Name", p.motherName || ""],
    ["Mother's Mobile", p.motherMobile || ""],
    ["Mother's Email", p.motherEmail || ""],
  ];

  const col1W = 75;
  const rowH = 5.2;

  doc.setLineWidth(0.2);
  doc.setDrawColor(180, 180, 180);

  personalFields.forEach(([label, val]) => {
    const rowY = y;
    // Row box
    doc.rect(leftMargin, rowY, contentWidth, rowH);
    // Vertical separator
    doc.line(leftMargin + col1W, rowY, leftMargin + col1W, rowY + rowH);

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(label, leftMargin + 2, rowY + 3.8);

    // Value
    doc.text(val || "", leftMargin + col1W + 2, rowY + 3.8);
    y += rowH;
  });

  y += 8;

  // Images Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("Images", leftMargin, y);
  y += 2;
  doc.setDrawColor(200, 200, 200);
  doc.line(leftMargin, y, rightMargin, y);

  y += 8;
  // Permanent Address
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("Permanent Address", leftMargin, y);

  y += 4;
  const addrBoxH = 18;
  doc.setDrawColor(180, 180, 180);
  doc.rect(leftMargin, y, contentWidth, addrBoxH);
  doc.line(leftMargin + 25, y, leftMargin + 25, y + addrBoxH);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Address", leftMargin + 2, y + 8);

  const permLines = [
    addr.permanent || "",
    addr.city ? `${addr.city},` : "",
    addr.state ? `${addr.state},` : "",
    addr.pincode || "",
  ].filter(Boolean);
  doc.text(permLines.join("\n"), leftMargin + 27, y + 4.5);

  y += addrBoxH + 6;

  // Correspondence Address
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("Correspondence Address", leftMargin, y);

  y += 4;
  doc.rect(leftMargin, y, contentWidth, addrBoxH);
  doc.line(leftMargin + 25, y, leftMargin + 25, y + addrBoxH);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Address", leftMargin + 2, y + 8);

  const corrLines = [
    addr.correspondence || "",
    addr.city ? `${addr.city},` : "",
    addr.state ? `${addr.state},` : "",
    addr.pincode || "",
  ].filter(Boolean);
  doc.text(corrLines.join("\n"), leftMargin + 27, y + 4.5);

  y += addrBoxH + 6;

  // Expectations from the Course
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("Expectations from the Course", leftMargin, y);

  // PAGE 2
  doc.addPage();
  let p2y = 18;

  // Expectations box
  const expBoxH = 34;
  doc.rect(leftMargin, p2y, contentWidth, expBoxH);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  let expTextY = p2y + 5;
  expectations.forEach((exp: string) => {
    doc.text(`• ${exp}`, leftMargin + 5, expTextY);
    expTextY += 5;
  });

  p2y += expBoxH + 8;

  // Academic Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("Academic Details", leftMargin, p2y);

  p2y += 4;
  const sections = ["Diploma", "12th", "Graduation", "10th"];

  sections.forEach((secName) => {
    // Subheading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(secName, leftMargin, p2y + 3);
    p2y += 5;

    const eduItem =
      education.find((e: any) => e.level?.toLowerCase().includes(secName.toLowerCase())) || {};

    const eduRows = [
      ["Course Name", eduItem.courseName || ""],
      ["Institute Name", eduItem.instituteName || ""],
      ["Board/University Name", eduItem.boardOrUniversity || ""],
      ["Year of passing", eduItem.yearOfPassing || ""],
      ["Obtained Percentage/CGPA", eduItem.scoreOrPercentage || ""],
    ];

    const eRowH = 5;
    eduRows.forEach(([eLabel, eVal]) => {
      const eRowY = p2y;
      doc.rect(leftMargin, eRowY, contentWidth, eRowH);
      doc.line(leftMargin + col1W, eRowY, leftMargin + col1W, eRowY + eRowH);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(eLabel, leftMargin + 2, eRowY + 3.6);
      doc.text(eVal || "", leftMargin + col1W + 2, eRowY + 3.6);
      p2y += eRowH;
    });

    p2y += 6;
  });

  // Save the document
  const fileName = `${(learner.name || "Learner").replace(/[^a-zA-Z0-9]/g, "_")}_Details.pdf`;
  doc.save(fileName);
}
