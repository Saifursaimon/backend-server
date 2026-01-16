const PDFDocument = require("pdfkit");
const path = require("path");
const labels = require("./labelMap");

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";

  if (typeof value === "boolean") {
    return value ? "是" : "否";
  }

  // ⭐ Format date nicely
  if (
    typeof value === "object" &&
    value.year !== undefined &&
    value.month !== undefined &&
    value.day !== undefined
  ) {
    const year = String(value.year).padStart(4, "0");
    const month = String(value.month).padStart(2, "0");
    const day = String(value.day).padStart(2, "0");

    return `${year}年 ${month}月 ${day}日`;
  }

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([k, v]) => {
        const label = labels[k] || k;
        return `${label}: ${formatValue(v)}`;
      })
      .join("，");
  }

  return String(value);
};


module.exports = function generateRecordPDF(record, res) {
  const doc = new PDFDocument({
    margin: 50,
    lineGap: 8, // ⭐ more breathing space
  });

  /* ---------- Chinese font ---------- */
  const fontPath = path.join(
    __dirname,
    "../assets/fonts/NotoSansSC-Regular.ttf"
  );

  doc.registerFont("cn", fontPath);
  doc.font("cn");

  /* ---------- headers ---------- */
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=record-${record.id || Date.now()}.pdf`
  );

  doc.pipe(res);

  /* ---------- Title ---------- */
  doc.fontSize(20).text("洽谈记录", { align: "center" });
  doc.moveDown(2);

  /* ---------- Section renderer ---------- */
  const renderSection = (titleKey, sectionData) => {
    if (!sectionData || Object.keys(sectionData).length === 0) return;

    const title = labels[titleKey] || titleKey;

    // Section title
    doc
      .fontSize(18)
      .text(title, { underline: true });

    doc.moveDown(1);

    Object.entries(sectionData).forEach(([key, value]) => {
      const label = labels[key] || key;

      // Label (slightly smaller)
      doc
        .fontSize(16)
        .text(`${label}：`, {
          continued: true,
        });

      // Value (⭐ bigger & clearer)
      doc
        .fontSize(14)
        .text(formatValue(value));

      doc.moveDown(0.8); // ⭐ spacing between rows
    });

    doc.moveDown(2); // ⭐ spacing between sections
  };

  /* ---------- Sections ---------- */
  renderSection("basicInfo", record.basicInfo);
  renderSection("coreNeeds", record.coreNeeds);
  renderSection("projectConstraints", record.projectConstraints);
  renderSection("specialNeeds", record.specialNeeds);

  doc.end();
};
