const PDFDocument = require("pdfkit");
const path = require("path");
const labels = require("./labelMap");

const formatValue = (key, value) => {
  if (value === null || value === undefined || value === "" || value === false) return null;

  // ⭐ Department special case
  if (key === "department" && typeof value === "object") {
    if (value.value === "其他") return value.otherText || null;
    return value.value || null;
  }

  if (typeof value === "boolean") return value ? "是" : null;

  if (typeof value === "object" && value.year !== undefined && value.month !== undefined && value.day !== undefined) {
    const year = String(value.year).padStart(4, "0");
    const month = String(value.month).padStart(2, "0");
    const day = String(value.day).padStart(2, "0");
    return `${year}年 ${month}月 ${day}日`;
  }

  if (typeof value === "object") {
    // Nested objects: format recursively
    const entries = Object.entries(value)
      .map(([k, v]) => {
        const formatted = formatValue(k, v);
        return formatted ? `${labels[k] || k}: ${formatted}` : null;
      })
      .filter(Boolean);
    return entries.length > 0 ? entries.join("，") : null;
  }

  return String(value);
};

module.exports = function generateRecordPDF(record, res) {
  const doc = new PDFDocument({
    margin: 50,
    lineGap: 8,
  });

  const fontPath = path.join(__dirname, "../assets/fonts/NotoSansSC-Regular.ttf");
  doc.registerFont("cn", fontPath);
  doc.font("cn");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=record-${record.id || Date.now()}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).text("洽谈记录", { align: "center" });
  doc.moveDown(2);

  const renderSection = (titleKey, sectionData) => {
  if (!sectionData || Object.keys(sectionData).length === 0) return;

  const title = labels[titleKey] || titleKey;
  doc.fontSize(18).text(title, { underline: true });
  doc.moveDown(1);

 

  Object.entries(sectionData).forEach(([key, value]) => {
    // Special handling for empty/false
    if (value === null || value === undefined || value === "" || value === false) return;

    const labelText = key === "department" ? "部门：" : `${labels[key] || key}：`;

    // If value is a nested object, print label once and render fields indented
    if (typeof value === "object" && !value.year) {
      doc.fontSize(16).text(labelText); // main label
      doc.moveDown(0.3);

      Object.entries(value).forEach(([subKey, subValue]) => {
        const formatted = formatValue(subKey, subValue);
        if (!formatted) return;

        // indent nested fields
        doc.fontSize(14).text(`${labels[subKey] || subKey}：${formatted}`, { indent: 20 });
        doc.moveDown(0.5);
      });

      doc.moveDown(0.8);
    } else {
      // normal field
      const formatted = formatValue(key, value);
      if (!formatted) return;

      doc.fontSize(16).text(labelText, { continued: true });
      doc.fontSize(14).text(formatted);
      doc.moveDown(0.8);
    }
  });

  doc.moveDown(2); // spacing between sections
};


  renderSection("basicInfo", record.basicInfo);
  renderSection("coreNeeds", record.coreNeeds);
  renderSection("projectConstraints", record.projectConstraints);
  renderSection("specialNeeds", record.specialNeeds);

  doc.end();
};
