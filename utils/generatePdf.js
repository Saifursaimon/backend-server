const PDFDocument = require("pdfkit");
const path = require("path");
const labels = require("./labelMap");

/**
 * Format values for display in PDF
 */
const formatValue = (key, value) => {
  if (value === null || value === undefined || value === "" || value === false) return null;

  // Department special case
  if (key === "department" && typeof value === "object") {
    if (value.value === "其他") return value.otherText || null;
    return value.value || null;
  }

  if (typeof value === "boolean") return value ? "是" : null;

  // Date format
  if (typeof value === "object" && value.year !== undefined && value.month !== undefined && value.day !== undefined) {
    const year = String(value.year).padStart(4, "0");
    const month = String(value.month).padStart(2, "0");
    const day = String(value.day).padStart(2, "0");
    return `${year}年 ${month}月 ${day}日`;
  }

  // Nested objects
  if (typeof value === "object") {
    const entries = Object.entries(value)
      .map(([k, v]) => {
        const formatted = formatValue(k, v);
        return formatted ? `${labels[k] || k}：${formatted}` : null;
      })
      .filter(Boolean);
    return entries.length > 0 ? entries.join("，") : null;
  }

  return String(value);
};

/**
 * Generate a professional negotiation record PDF
 */
module.exports = function generateRecordPDF(record, res) {
  const doc = new PDFDocument({
    margin: 50,
    lineGap: 6,
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

  /** ---------- Header ---------- */
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const recordNumber = `DH-${year}${month}${String(record.id || 0).padStart(3, "0")}`;

  doc.fontSize(20).text("洽谈记录", { align: "center" });
  doc.fontSize(12).text(`洽谈编号：${recordNumber}`, { align: "right" });
  doc.moveDown(2);

  /** ---------- Render section ---------- */
  const renderSection = (titleKey, sectionData) => {
    if (!sectionData || Object.keys(sectionData).length === 0) return;

    const title = labels[titleKey] || titleKey;
    doc.fontSize(16).fillColor("#000").text(title, { underline: true });
    doc.moveDown(0.8);

    Object.entries(sectionData).forEach(([key, value]) => {
      const formatted = formatValue(key, value);
      if (!formatted) return;

      const labelText = key === "department" ? "部门：" : `${labels[key] || key}：`;

      // Nested objects
      if (typeof value === "object" && !value.year) {
        doc.fontSize(14).fillColor("#000").text(labelText); // main label
        doc.moveDown(0.3);

        Object.entries(value).forEach(([subKey, subValue]) => {
          const subFormatted = formatValue(subKey, subValue);
          if (!subFormatted) return;

          doc.fontSize(12)
            .fillColor("#333")
            .text(`${labels[subKey] || subKey}：${subFormatted}`, { indent: 20 });
          doc.moveDown(0.4);
        });

        doc.moveDown(0.6);
      } else {
        // Normal field
        doc.fontSize(14).fillColor("#000").text(labelText, { continued: true });
        doc.fontSize(12).fillColor("#333").text(formatted);
        doc.moveDown(0.6);
      }
    });

    doc.moveDown(1.2); // Space between sections
  };

  // ---------- Render all main sections ----------
  renderSection("basicInfo", record.basicInfo);
  renderSection("coreNeeds", record.coreNeeds);
  renderSection("projectConstraints", record.projectConstraints);
  renderSection("specialNeeds", record.specialNeeds);

  doc.end();
};
