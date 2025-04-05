import { get } from '@vercel/blob';

export default async function handler(req, res) {
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).send("No filename provided");
  }

  try {
    // Lấy file từ Vercel Blob
    const blob = await get(filename);
    if (!blob) {
      return res.status(404).send("File not found");
    }

    // Đọc nội dung file
    const arrayBuffer = await blob.arrayBuffer();
    const content = Buffer.from(arrayBuffer);

    // Thiết lập header dựa trên loại file
    const mimeType = blob.type || "text/plain";
    res.setHeader("Content-Type", `${mimeType}; charset=utf-8`);
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.status(200).send(content);
  } catch (error) {
    return res.status(500).send(`Error: ${error.message}`);
  }
}
