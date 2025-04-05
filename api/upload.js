import { put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid"; // Thêm thư viện này vào dependencies

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Phương thức không được phép" });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    
    if (!file) {
      return res.status(400).json({ message: "Không có file được tải lên" });
    }

    // Kiểm tra dung lượng file ở server (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({ message: "File quá lớn! Kích thước tối đa là 5MB." });
    }

    // Kiểm tra loại file được phép
    const allowedTypes = ["text/plain", "image/jpeg", "image/png", "application/pdf", "text/x-lua"];
    if (!allowedTypes.includes(file.type)) {
      return res.status(400).json({ 
        message: "Loại file không được hỗ trợ. Chỉ chấp nhận .txt, .jpg, .png, .pdf, .lua" 
      });
    }

    // Tạo tên file an toàn và độc nhất
    const originalFilename = file.name;
    const fileExt = originalFilename.split('.').pop().toLowerCase();
    const safeFilename = `${sanitizeFilename(originalFilename.split('.')[0])}-${uuidv4().slice(0, 8)}.${fileExt}`;

    // Upload file với multipart để hỗ trợ file lớn
    const { url } = await put(safeFilename, file, { 
      access: "public", 
      multipart: true,
      addRandomSuffix: false, // Sử dụng tên file đã được tạo độc nhất
      contentType: file.type // Đặt đúng content-type
    });

    // Trả về URL và metadata cho client
    return res.status(200).json({ 
      url,
      filename: originalFilename,
      size: file.size,
      type: file.type
    });
    
  } catch (error) {
    console.error("Lỗi khi tải file:", error);
    return res.status(500).json({ 
      message: "Đã xảy ra lỗi khi tải file lên",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}

// Hàm làm sạch tên file, loại bỏ ký tự không an toàn
function sanitizeFilename(filename) {
  // Loại bỏ ký tự đặc biệt và khoảng trắng thành gạch ngang
  return filename
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}
