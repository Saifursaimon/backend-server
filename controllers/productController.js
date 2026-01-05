const db = require('../db/index');
const uploadBuffer = require('../utils/cloudinaryUpload');


exports.getAllProducts = async (req,res) => {
   const rows = db.prepare('SELECT * FROM products').all();
  const products = rows.map(row => ({
    ...row,
    images: JSON.parse(row.images),
    documents: JSON.parse(row.documents),
    contacts: JSON.parse(row.contacts)
  }));
  res.json(products)
}


exports.getProduct = async (req,res) => {
   const { id } = req.params;
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Product not found' });

  const product = {
    ...row,
    images: JSON.parse(row.images),
    documents: JSON.parse(row.documents),
    contacts: JSON.parse(row.contacts)
  };
  res.json(product);
}


exports.createProduct = async (req, res) => {
  try {
   
    const {
      name,
      category,
      categoryId,
      description,
      date,
      contacts
    } = req.body;

    const coverFile = req.files.cover?.[0];
    const imageFiles = req.files.images || [];
    const pdfFiles = req.files.documents || [];

    let coverUrl = '';
    if (coverFile) {
      const result = await uploadBuffer(
        coverFile.buffer,
        'products/covers'
      );
      coverUrl = result.secure_url;
    }
    const imageUrls = [];
    for (const file of imageFiles) {
      const result = await uploadBuffer(
        file.buffer,
        'products/images'
      );
      imageUrls.push(result.secure_url);
    }

    /* ---------- upload PDFs ---------- */
    const documentUrls = [];
    for (const file of pdfFiles) {
      const result = await uploadBuffer(
        file.buffer,
        'products/documents',
      );
      documentUrls.push({
        name: file.originalname,
        url: result.secure_url
      });
    }
    
     const stmt = db.prepare(`
      INSERT INTO products
      (name, category, categoryId, description, date, thmbnl, images, documents, contacts)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      name,
      category,
      categoryId,
      description,
      date,
      coverUrl,
      JSON.stringify(imageUrls),
      JSON.stringify(documentUrls),
      contacts || '[]'
    );

    res.status(201).json({ success: true, id: info.lastInsertRowid });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    /* 1️⃣ Get existing product */
    const existing = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(id);

    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    /* 2️⃣ Body */
    const {
      name,
      category,
      categoryId,
      description,
      date,
      contacts,
      existingImages,
      existingDocuments
    } = req.body;

    /* 3️⃣ COVER */
    let coverUrl = existing.thmbnl;
    const coverFile = req.files?.cover?.[0];

    if (coverFile) {
      const result = await uploadBuffer(coverFile.buffer, "products/covers");
      coverUrl = result.secure_url;
    }

    /* 4️⃣ IMAGES (MERGE LOGIC ✅) */
    const keptImages = existingImages
      ? JSON.parse(existingImages)
      : JSON.parse(existing.images || "[]");

    const newImageFiles = req.files?.images || [];
    const newImageUrls = [];

    for (const file of newImageFiles) {
      const result = await uploadBuffer(file.buffer, "products/images");
      newImageUrls.push(result.secure_url);
    }

    const finalImages = [...keptImages, ...newImageUrls];

    /* 5️⃣ DOCUMENTS (MERGE LOGIC ✅) */
    const keptDocuments = existingDocuments
      ? JSON.parse(existingDocuments)
      : JSON.parse(existing.documents || "[]");

    const pdfFiles = req.files?.documents || [];
    const newDocuments = [];

    for (const file of pdfFiles) {
      const result = await uploadBuffer(
        file.buffer,
        "products/documents"
      );
      newDocuments.push({
        name: file.originalname,
        url: result.secure_url,
      });
    }

    const finalDocuments = [...keptDocuments, ...newDocuments];

    /* 6️⃣ CONTACTS */
    const finalContacts = contacts
      ? JSON.parse(contacts)
      : JSON.parse(existing.contacts || "[]");

    /* 7️⃣ UPDATE */
    db.prepare(`
      UPDATE products SET
        name = ?,
        category = ?,
        categoryId = ?,
        description = ?,
        date = ?,
        thmbnl = ?,
        images = ?,
        documents = ?,
        contacts = ?
      WHERE id = ?
    `).run(
      name,
      category,
      categoryId,
      description,
      date,
      coverUrl,
      JSON.stringify(finalImages),
      JSON.stringify(finalDocuments),
      JSON.stringify(finalContacts),
      id
    );

    res.json({ message: "Product updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};



exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    const result = stmt.run(productId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ success: true, msg: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

