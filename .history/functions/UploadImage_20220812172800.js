const multer = require('multer');
const path = require("path");
const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {

  let ext = path.extname(file.originalname); 
  console.log("🚀 ~ file: UploadImage.js ~ line 8 ~ fileFilter ~ ext", ext)
   
  if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
    cb(new Error("File type is not supported"), false);
    return;
  }
  cb(null, true);
};

const upload = multer({
  fileFilter: fileFilter,
  storage: storage,
  limits: { fileSize: 2000 * 2000 * 5 },
  
});

module.exports = upload