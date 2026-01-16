const PDFDocument = require("pdfkit");
const path = require("path");
const labels = require("./labelMap");

/**
 * Format values for display in PDF
 */
const formatValue = (key, value) => {
  if (value === null || value === undefined || value === "" || value === false) {
    return null;
  }

  // Department special case
  if (key === "department" && typeof value === "object") {
    if (value.value === "其他") return value.value;
    return value.value || null;
  }

  // Boolean
  if (typeof value === "boolean") return value ? "是" : null;

  // Date object
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

  // Normal value
  if (typeof value !== "object") {
    return String(value);
  }

  return null;
};

/**
 * Generate professional negotiation record PDF
 */
module.exports = function generateRecordPDF(record, res) {
  const doc = new PDFDocument({
    margin: 50,
    lineGap: 6,
  });

  // Font
  const fontPath = path.join(
    __dirname,
    "../assets/fonts/NotoSansSC-Regular.ttf"
  );
  doc.registerFont("cn", fontPath);
  doc.font("cn");

  // Headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=record-${record.id || Date.now()}.pdf`
  );

  doc.pipe(res);

  /** ---------- Header ---------- */
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const recordNumber = `DH-${year}${month}${String(
    record.id || 1
  ).padStart(3, "0")}`;

  doc.fontSize(20).fillColor("#000").text("洽谈记录", { align: "center" });
  doc
    .fontSize(12)
    .fillColor("#000")
    .text(`洽谈编号：${recordNumber}`, { align: "right" });

  doc.moveDown(2);

  /** ---------- Section Renderer ---------- */
  const renderSection = (titleKey, sectionData) => {
    if (!sectionData || Object.keys(sectionData).length === 0) return;

    const title = labels[titleKey] || titleKey;

    // Section title
    doc.fontSize(16).fillColor("#000").text(title, { underline: true });
    doc.moveDown(0.8);

    Object.entries(sectionData).forEach(([key, value]) => {
      const formatted = formatValue(key, value);
      if (!formatted && typeof value !== "object") return;

      const labelText =
        key === "department" ? "部门：" : `${labels[key] || key}：`;

      const isDateObject =
        typeof value === "object" &&
        value.year !== undefined &&
        value.month !== undefined &&
        value.day !== undefined;

      const isDepartment = key === "department";

      const isNestedObject =
        typeof value === "object" &&
        !isDateObject &&
        !isDepartment &&
        !Array.isArray(value);

      // ---------- Nested object (联系人 etc.) ----------
      if (isNestedObject) {
        doc.fontSize(14).fillColor("#000").text(labelText);
        doc.moveDown(0.2);

        Object.entries(value).forEach(([subKey, subValue]) => {
          const subFormatted = formatValue(subKey, subValue);
          if (!subFormatted) return;

          doc
            .fontSize(13)
            .fillColor("#333")
            .text(`${labels[subKey] || subKey}：${subFormatted}`, {
              indent: 20,
            });
        });

        doc.moveDown(0.6);
      } else {
        // ---------- Single line ----------
        const finalValue = formatted || "";

        doc
          .fontSize(14)
          .fillColor("#000")
          .text(labelText, { continued: true });

        doc.fontSize(14).fillColor("#333").text(finalValue);

        doc.moveDown(0.6);
      }
    });

    doc.moveDown(1.2);
  };

  /** ---------- Render Sections ---------- */
  renderSection("basicInfo", record.basicInfo);
  renderSection("coreNeeds", record.coreNeeds);
  renderSection("projectConstraints", record.projectConstraints);
  renderSection("specialNeeds", record.specialNeeds);

  doc.end();
};
