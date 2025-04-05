import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Kiểm tra dung lượng file ở server (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({ message: "File too large! Max size is 5MB." });
    }

    const filename = file.name;

    // Upload file lên Vercel Blob
    const { url } = await put(filename, file, { access: "public", multipart: true });
    return res.status(200).json({ url });
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
