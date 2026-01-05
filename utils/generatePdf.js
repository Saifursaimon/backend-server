const PDFDocument = require("pdfkit");
const path = require("path");
const labels = require("./labelMap");

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";

  if (typeof value === "boolean") {
    return value ? "是" : "否";
  }

  if (
    typeof value === "object" &&
    value.year &&
    value.month &&
    value.day
  ) {
    return `年: ${value.year} | 月: ${value.month} | 日: ${value.day}`;
  }

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([k, v]) => {
        const label = labels[k] || k;
        return `${label}: ${formatValue(v)}`;
      })
      .join(" | ");
  }

  return String(value);
};

module.exports = function generateRecordPDF(record, res) {
  const doc = new PDFDocument({ margin: 50 });

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
  doc.fontSize(18).text("洽谈记录", { align: "center" });
  doc.moveDown(2);

  /* ---------- Section renderer ---------- */
  const renderSection = (titleKey, sectionData) => {
    if (!sectionData) return;

    const title = labels[titleKey] || titleKey;

    doc
      .fontSize(14)
      .text(title, { underline: true });

    doc.moveDown(0.5);

    doc.fontSize(11);

    Object.entries(sectionData).forEach(([key, value]) => {
      const label = labels[key] || key;
      doc.text(`${label}：${formatValue(value)}`);
    });

    doc.moveDown(1.5);
  };

  /* ---------- Sections ---------- */
  renderSection("basicInfo", record.basicInfo);
  renderSection("coreNeeds", record.coreNeeds);
  renderSection("projectConstraints", record.projectConstraints);
  renderSection("specialNeeds", record.specialNeeds);

  doc.end();
};
