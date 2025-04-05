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

    const fileType = file.type;
    const filename = file.name;

    // Nếu là ảnh, upload lên Imgur
    if (fileType.startsWith("image/")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const imgurForm = new FormData();
      imgurForm.append("image", buffer.toString("base64"));

      const imgurResponse = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          Authorization: "Client-ID 1e5e1cfae8d5d8f", // Thay bằng Client-ID của bạn nếu cần
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
    // Nếu là text hoặc lua, trả về base64 tạm thời
    else if (fileType === "text/plain" || filename.endsWith(".lua")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = `data:${fileType};base64,${buffer.toString("base64")}`;
      return res.status(200).json({ url: base64 });
    } else {
      return res.status(400).json({ message: "Unsupported file type" });
    }
  } catch (error) {
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}
