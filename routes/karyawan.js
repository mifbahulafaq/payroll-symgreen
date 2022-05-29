const fs = require('fs');
const path = require('path');
const query = require('../config/query');

module.exports = function(router){
        //Create
        router.get('/tambah', async (req,res)=>{
            const {result} = await query.select(['bagian']);
            res.render('index',{data : result, page : 'karyawan/tambah',dataMenu:'dataKaryawan',dataDropDown:'karyawan'});
        });
       
        router.post('/', async (req,res)=>{
                if(req.multerErr){
                    req.flash('errorImage',req.multerErr.message);
                    res.redirect('/karyawan/tambah');
                }else if(req.unknownErr){
                    
                    req.flash('errorImage',req.unknownErr.message);
                    res.redirect('/karyawan/tambah');
                }else{
                    console.log('else')
                    const regex = /[^,\d]/g;
                    req.body.foto = req.file.filename;
                    req.body.upahPerHari = req.body.upahPerHari.replace(regex,"");
                    const {result} = await query.insert('karyawan',req.body);
                    res.redirect('/karyawan');
                }
        });
    
        //Read    
        router.get('/', async (req,res)=>{
            // if(!req.session.login){
            //     req.flash('error','Anda harus Login terlebih dahulu')
            //     throw res.redirect('/auth/login')
            // }
            const obj = {
                slc : '*',
                frm:'karyawan',
                jn :'bagian',
                fkFrm :'idBagian',
                pkJn : 'idBagian'
            }
            const {result} = await query.slcJn(obj)
            res.render('index',{data : result, page : 'karyawan/data',dataMenu:'dataKaryawan',dataDropDown:'karyawan'});
        });
        
        // //Update
        router.get('/edit/:nik', async (req,res)=>{
            const {result} = await query.select(['karyawan',{nik:req.params.nik},'bagian']);
            const [karyawan,bagian] = result;
            res.render('index',{page : 'karyawan/edit', kar : karyawan[0],bag : bagian,dataMenu:'dataKaryawan',dataDropDown:'karyawan'});
                
        });

        router.put('/', async (req,res)=>{
            if(req.multerErr){
                req.flash('errorImage',req.multerErr.message);
                res.redirect('/karyawan/edit');
            }else if(req.unknownErr){
                req.flash('errorImage',req.unknownErr.message);
                res.redirect('/karyawan/edit');
            }else{
                if(req.file){
                    fs.unlinkSync(path.join(__dirname,'../uploads/images/'+req.body.fotoLama),err =>{
                        if(err) return res.send(err);
                    })
                    req.body.foto = req.file.filename;
                    delete req.body.fotoLama;
                }else{
                    req.body.foto = req.body.fotoLama;
                    delete req.body.fotoLama;
                }
                const regex = /[^,\d]/g;
                req.body.upahPerHari = req.body.upahPerHari.replace(regex,"");
                const nik = req.body.nik;
                const {result} = await query.update(['karyawan',req.body,{nik}]);
                res.redirect('/karyawan');
            }
        })

        
        //Delete
        router.delete('/', async (req,res)=>{
            // Pegawai.deleteOne({_id : req.params.id},err=> {
            //     if(err) res.send(err);
            //     Absensi.deleteMany({idPegawai : req.params.id },(err,data)=>{
            //         console.log(data)
            //         if(err) return res.send(err);
            //         Lembur.deleteMany({idPegawai : req.params.id },err=>{
            //             if(err) return res.send(err);
            //             Kasbon.deleteMany({idPegawai : req.params.id },err=>{
            //                 if(err) return res.send(err);
            //                 Gaji.deleteMany({idPegawai : req.params.id },err=>{
            //                     if(err) return res.send(err);
            //                     res.redirect('/pegawai/data');
            //                 })
            //                 })
            //             })
            //         })
            //     })

            const {result} = await query.delete1(['karyawan',{nik:req.body.nik}]);
            if(result.affectedRows>0){
                fs.unlinkSync(path.join(__dirname,'../uploads/images/'+req.body.foto),err =>{
                    if(err) throw err;
                })
                res.redirect('/karyawan');
            }else{
                req.flash('error','Data Gagal dihapus..');
                res.redirect('/karyawan');
            }
        });
        
        return router
}
 

