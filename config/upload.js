const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,path.join(__dirname,'../uploads/images'));
    },
    filename : function(req,file,cb){
        cb(null,file.fieldname+Date.now()+path.extname(file.originalname));
    }  
})

const fileFilter = function(req, file, cb){
    const ext = ['.jpg','.png','.jpeg'];
    const file2 = path.extname(file.originalname).toLocaleLowerCase();

    if(ext.indexOf(file2) == -1){
        return cb(new Error('yang anda Upload bukan Gambar'));
    }
    cb(null,true);
}

const upload = multer({storage : storage,
                        fileFilter : fileFilter,
                        limits: {fileSize : 300000} })
                        .single('foto');

module.exports = upload;