import { put } from '@vercel/blob';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false, // Tắt bodyParser để dùng formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 }); // 5MB

  try {
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filename = file.originalFilename || "unnamed-file";
    const buffer = require('fs').readFileSync(file.filepath);

    // Upload file lên Vercel Blob
    const { url } = await put(filename, buffer, { access: "public" });

    // Trả về tên file để dùng trong /raw/[filename]
    return res.status(200).json({ filename });
  } catch (error) {
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}
