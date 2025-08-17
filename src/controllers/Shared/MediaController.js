import upload from '../../middlewares/fileUpload.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Single or multiple file upload, returns filename and public URL
export const uploadMedia = async (req, res) => {
  try {
    upload.any()(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'File size should not exceed 5MB' });
        }
        return res.status(400).json({ success: false, message: err.message });
      }
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'Please upload at least one file' });
      }

      const items = req.files.map((f) => ({
        filename: f.filename,
        fileurl: `${req.protocol}://${req.get('host')}/public/${f.filename}`,
      }));

      return res.status(200).json({ success: true, message: 'File(s) uploaded successfully', data: items });
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.body;

    const filePath = path.join(__dirname, '..', '..', 'public', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.status(200).json({ success: true, message: 'Image removed successfully' });
    }
    return res.status(404).json({ success: false, message: 'Image not found' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Delete error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};





