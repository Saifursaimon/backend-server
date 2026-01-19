const db = require("../db");



exports.createRecord = (req, res) => {
  try {
    const {
      basicInfo,
      coreNeeds,
      projectConstraints,
      specialNeeds,
    } = req.body;

    if (!basicInfo || !coreNeeds) {
      return res.status(400).json({ message: "Missing required data" });
    }

    const stmt = db.prepare(`
      INSERT INTO records
      (basicInfo, coreNeeds, projectConstraints, specialNeeds, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      JSON.stringify(basicInfo),
      JSON.stringify(coreNeeds),
      JSON.stringify(projectConstraints || {}),
      JSON.stringify(specialNeeds || {}),
      new Date().toISOString()
    );

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
    });
  } catch (err) {
    console.error("Create record failed:", err);
    res.status(500).json({ message: "Failed to create record" });
  }
};

exports.updateRecord = (req, res) => {
  try {
    const { id } = req.params;
    const {
      basicInfo,
      coreNeeds,
      projectConstraints,
      specialNeeds,
    } = req.body;

    // Check if record exists
    const existing = db
      .prepare(`SELECT * FROM records WHERE id = ?`)
      .get(id);

    if (!existing) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Merge new data with existing data
    const updatedBasicInfo = basicInfo
      ? JSON.stringify(basicInfo)
      : existing.basicInfo;

    const updatedCoreNeeds = coreNeeds
      ? JSON.stringify(coreNeeds)
      : existing.coreNeeds;

    const updatedProjectConstraints = projectConstraints
      ? JSON.stringify(projectConstraints)
      : existing.projectConstraints;

    const updatedSpecialNeeds = specialNeeds
      ? JSON.stringify(specialNeeds)
      : existing.specialNeeds;

    db.prepare(`
      UPDATE records
      SET
        basicInfo = ?,
        coreNeeds = ?,
        projectConstraints = ?,
        specialNeeds = ?
      WHERE id = ?
    `).run(
      updatedBasicInfo,
      updatedCoreNeeds,
      updatedProjectConstraints,
      updatedSpecialNeeds,
      id
    );

    res.json({
      success: true,
      message: "Record updated successfully",
    });
  } catch (err) {
    console.error("Update record failed:", err);
    res.status(500).json({ message: "Failed to update record" });
  }
};


exports.getAllRecords = (req, res) => {
  try {
    const rows = db.prepare(`SELECT * FROM records ORDER BY id DESC`).all();

    const records = rows.map((r) => ({
      id: r.id,
      basicInfo: JSON.parse(r.basicInfo),
      coreNeeds: JSON.parse(r.coreNeeds),
      projectConstraints: JSON.parse(r.projectConstraints),
      specialNeeds: JSON.parse(r.specialNeeds),
      createdAt: r.createdAt,
    }));

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch records" });
  }
};


exports.getRecordById = (req, res) => {
  try {
    const record = db
      .prepare(`SELECT * FROM records WHERE id = ?`)
      .get(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({
      id: record.id,
      basicInfo: JSON.parse(record.basicInfo),
      coreNeeds: JSON.parse(record.coreNeeds),
      projectConstraints: JSON.parse(record.projectConstraints),
      specialNeeds: JSON.parse(record.specialNeeds),
      createdAt: record.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch record" });
  }
};


exports.deleteRecord = (req, res) => {
  try {
    const result = db
      .prepare(`DELETE FROM records WHERE id = ?`)
      .run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};

