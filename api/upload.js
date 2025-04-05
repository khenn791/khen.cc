import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return res.status(400).json({ message: "File too large! Max size is 5MB." });
    }

    const filename = file.name || "uploaded-file"; // Đảm bảo có tên file
    const { url } = await put(filename, file, { access: "public" }); // Bỏ multipart nếu không cần

    return res.status(200).json({ url });
  } catch (error) {
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}
