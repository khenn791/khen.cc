import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false, // Tắt bodyParser mặc định để dùng formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 }); // Giới hạn 5MB

  try {
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file = files.file?.[0]; // Lấy file đầu tiên
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Nếu là ảnh, upload lên Imgur
    if (file.mimetype.startsWith("image/")) {
      const imgurForm = new FormData();
      imgurForm.append("image", file.toString("base64"));

      const imgurResponse = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          Authorization: "Client-ID 1e5e1cfae8d5d8f", // Client-ID công khai (thay bằng của bạn nếu cần)
        },
        body: imgurForm,
      });

      const imgurData = await imgurResponse.json();
      if (imgurData.success) {
        return res.status(200).json({ url: imgurData.data.link });
      } else {
        return res.status(500).json({ message: "Failed to upload to Imgur" });
      }
    } 
    // Nếu là text hoặc lua, trả về base64
    else if (file.mimetype === "text/plain" || file.originalFilename.endsWith(".lua")) {
      const buffer = require('fs').readFileSync(file.filepath);
      const base64 = `data:${file.mimetype};base64,${buffer.toString("base64")}`;
      return res.status(200).json({ url: base64 });
    } else {
      return res.status(400).json({ message: "Unsupported file type" });
    }
  } catch (error) {
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}
