const Pegawai = require('../model/m_penggajian').pegawai;
const Bagian = require('../model/m_penggajian').bagian;
const Absensi = require('../model/m_penggajian').absensi;
const Lembur = require('../model/m_penggajian').lembur
const Kasbon = require('../model/m_penggajian').kasbon;
const Gaji = require('../model/m_penggajian').gaji;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,path.join(__dirname,'../uploads/images'));
    },
    filename : function(req,file,cb){
        console.log(req.body)
        cb(null,file.fieldname+Date.now()+path.extname(file.originalname));
    }  
})

const fileFilter = function(req, file, cb){
    const ext = ['.jpg','.png','.jpeg'];
    const file2 = path.extname(file.originalname).toLocaleLowerCase();

    console.log(req.body)
    if(ext.indexOf(file2) == -1){
        req.gagal = 'yang anda Upload bukan Gambar';
        return cb(null,false);
    }
    cb(null,true);
}

const upload = multer({storage : storage,
                        fileFilter : fileFilter,
                        limits: {fileSize : 1000000} })
                        .single('foto');

module.exports = function(app,pegawai){
        //Create
        pegawai.get('/tambah',(req,res)=>{
            if(!req.session.login){
                req.flash('error','Anda harus Login terlebih dahulu')
                throw res.redirect('/auth/login')
            }
            
            Bagian.find((err,data)=>{
                res.render('index',{data : data, page : 'pegawai/tambah'});
            });
        });
       
            
        pegawai.post('/tambah',(req,res)=>{
            if(!req.session.login){
                req.flash('error','Anda harus Login terlebih dahulu')
                throw res.redirect('/auth/login')
            }

           upload(req,res,function(err){
                if(err instanceof multer.MulterError){
                    req.flash('errorImage',err.message);
                    return res.redirect('/pegawai/tambah');
                }else if(err){
                    req.flash('errorImage',err.message);
                    return res.redirect('/pegawai/tambah');
                }
                const arrLahir = req.body.tglLahir.split('-')
                const arrMasuk = req.body.tglMasuk.split('-')

                const tglLahir = new Date(arrLahir[0],arrLahir[1]-1,arrLahir[2]);
                const tglMasuk = new Date(arrMasuk[0],arrMasuk[1]-1,arrMasuk[2]);
                const regex = /[^,\d]/g;
                
                let dataPegawai = new Pegawai({
                    idBagian : req.body.idBagian,
                    nip : req.body.nip,
                    nama : req.body.nama,
                    jenKelamin : req.body.jenKelamin,
                    tempat : req.body.tempat,
                    tglLahir : Date.parse(tglLahir),
                    foto : req.file.filename,
                    alamat : req.body.alamat,
                    gajiPokok : req.body.gajiPokok.replace(regex,""),
                    insentif : Number(req.body.insentif.replace(regex,"")),
                    noTelp : req.body.noTelp,
                    tglMasuk : Date.parse(tglMasuk),
                    })
                dataPegawai.save((err,data)=>{
                    
                    if(err) return res.send(err);
                    res.redirect('/pegawai/data');
                });
            });

            
        
        });
    
        //Read    
        pegawai.get('/data',(req,res)=>{
            if(!req.session.login){
                req.flash('error','Anda harus Login terlebih dahulu')
                throw res.redirect('/auth/login')
            }
            
            Pegawai.find().populate('idBagian').exec((err,data)=>{
                if(err) return res.send(err);
                res.render('index',{data : data, page : 'pegawai/data'});
            });
        });
        

        //Update
        pegawai.get('/edit/:id',(req,res)=>{
            if(!req.session.login){
                req.flash('error','Anda harus Login terlebih dahulu')
                throw res.redirect('/auth/login')
            }
            
            Pegawai.findById({_id : req.params.id}).populate('idBagian').exec((err,dataPegawai)=>{
                if(err) throw err;
                const tglLahir = new Date(dataPegawai.tglLahir);
                const tglMasuk = new Date(dataPegawai.tglMasuk);
                Bagian.find({},(err,dataBagian)=>{
                    if(err) return res.send(err)
                    res.render('index',{page : 'pegawai/edit',
                    dataPegawai : dataPegawai,tglMasuk : tglMasuk, tglLahir : tglLahir, dataBagian: dataBagian});
                })

            });
                
        });

        pegawai.post('/edit',(req,res)=>{
            if(!req.session.login){
                req.flash('error','Anda harus Login terlebih dahulu')
                throw res.redirect('/auth/login')
            }
            upload(req,res,function(err){
                if(err instanceof multer.MulterError){
                    req.flash('errorImage',err.message);
                    return res.redirect('/pegawai/edit/'+req.body.id);
                }else if(req.gagal){
                    req.flash('errorImage',req.gagal);
                    return res.redirect('/pegawai/edit/'+req.body.id);
                }

                Pegawai.findById(req.body.id,(err,dataPegawai)=>{
                    if(err) throw err;
                    const arrLahir = req.body.tglLahir.split('-')
                    const arrMasuk = req.body.tglMasuk.split('-')
        
                    const tglLahir = new Date(arrLahir[0],arrLahir[1]-1,arrLahir[2]);
                    const tglMasuk = new Date(arrMasuk[0],arrMasuk[1]-1,arrMasuk[2]);
                    const regex = /[^,\d]/g;
                    dataPegawai.idBagian = req.body.idBagian;
                    dataPegawai.nama = req.body.nama;
                    dataPegawai.jenKelamin = req.body.jenKelamin;
                    dataPegawai.tempat = req.body.tempat;
                    dataPegawai.tglLahir = Date.parse(tglLahir);

                    if(req.file){
                        fs.unlinkSync(path.join(__dirname,'../uploads/images/'+dataPegawai.foto),err =>{
                            if(err) return res.send(err);
                        })
                        dataPegawai.foto = req.file.filename;
                    }else{
                        dataPegawai.foto = dataPegawai.foto;
                    }
                    dataPegawai.alamat = req.body.alamat;
                    dataPegawai.gajiPokok = req.body.gajiPokok.replace(regex,"");
                    dataPegawai.insentif = Number(req.body.insentif.replace(regex,""));
                    dataPegawai.noTelp = req.body.noTelp;
                    dataPegawai.tglMasuk = Date.parse(tglMasuk);
                    dataPegawai.save((err,data)=>{
                        if(err) return res.send(err);
                        res.redirect('/pegawai/data');
                    });
                })
            });
        })

        
        //Delete
        pegawai.delete('/hapus/:id',(req,res)=>{
            if(!req.session.login){
                req.flash('error','Anda harus Login terlebih dahulu')
                throw res.redirect('/auth/login')
            }
            
            Pegawai.deleteOne({_id : req.params.id},err=> {
                if(err) res.send(err);
                Absensi.deleteMany({idPegawai : req.params.id },(err,data)=>{
                    console.log(data)
                    if(err) return res.send(err);
                    Lembur.deleteMany({idPegawai : req.params.id },err=>{
                        if(err) return res.send(err);
                        Kasbon.deleteMany({idPegawai : req.params.id },err=>{
                            if(err) return res.send(err);
                            Gaji.deleteMany({idPegawai : req.params.id },err=>{
                                if(err) return res.send(err);
                                res.redirect('/pegawai/data');
                            })
                            })
                        })
                    })
                })
                
            });
        
 
    
        app.use('/pegawai',pegawai);


}
 

