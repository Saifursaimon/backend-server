/* -------------------------------------------------
 *  STYLE-ONLY RE-WRITE  (keeps your data logic)
 * -------------------------------------------------*/
module.exports = function generateRecordPDF(record, res) {
  const doc = new PDFDocument({ margin: 45, size: 'A4' });
  const fontPath = path.join(__dirname, '../assets/fonts/NotoSansSC-Regular.ttf');
  doc.registerFont('cn', fontPath);
  doc.font('cn');

  /* ---------- response headers ---------- */
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=record-${record.id || Date.now()}.pdf`
  );
  doc.pipe(res);

  /* ---------- top-right serial ---------- */
  const now = new Date();
  const serial = `DH-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}001`;
  doc.fontSize(10).text(serial, 0, 45, { align: 'right' });

  /* ---------- header bar helper ---------- */
  const headerBar = (text, y) => {
    doc.rect(45, y, 510, 22).fill('#4472C4').fillColor('white').fontSize(12)
       .text(text, 50, y + 4);
    return y + 22 + 15; // return new y
  };

  /* ---------- two-column line helper ---------- */
  const twoCol = (label, value, y) => {
    if (y > 700) { doc.addPage(); y = 50; }
    doc.fillColor('black').fontSize(10)
       .text(label, 50, y, { continued: true })
       .text(value, 180, y);
    return y + 20;
  };

  /* ---------- styled section renderer ---------- */
  const renderSectionStyled = (titleKey, sectionData, startY) => {
    if (!sectionData || !Object.keys(sectionData).length) return startY;

    let y = headerBar(labels[titleKey] || titleKey, startY);

    Object.entries(sectionData).forEach(([key, raw]) => {
      const formatted = formatValue(key, raw);
      if (!formatted) return;
      y = twoCol(`${labels[key] || key}：`, formatted, y);
    });
    return y + 15; // spacer before next section
  };

  /* ---------- render all sections ---------- */
  let y = 90;
  y = renderSectionStyled('basicInfo',     record.basicInfo,     y);
  y = renderSectionStyled('coreNeeds',     record.coreNeeds,     y);
  y = renderSectionStyled('projectConstraints', record.projectConstraints, y);
  y = renderSectionStyled('specialNeeds',  record.specialNeeds,  y);

  doc.end();
};