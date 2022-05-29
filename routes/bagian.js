const fs = require('fs');
const path = require('path');
const query = require('../config/query');

module.exports = function(router){
        //Create
        router.get('/tambah', async (req,res)=>{
            res.render('index',{page : 'bagian/tambah',dataMenu:'bagian',dataDropDown:'karyawan'});
        });
       
        router.post('/', async (req,res)=>{
            const regex = /[^,\d]/g;
            req.body.uangMakan = req.body.uangMakan.replace(regex,"");
            req.body.insentif = req.body.insentif.replace(regex,"");
            const {result} = await query.insert('bagian',req.body);
            res.redirect('/bagian');
        });
    
        //Read    
        router.get('/', async (req,res)=>{
            const {result} = await query.select(['bagian'])
            res.render('index',{data : result, page : 'bagian/data',dataMenu:'bagian',dataDropDown:'karyawan'});
        });
        

        // //Update
        router.get('/edit/:idBagian', async (req,res)=>{
            const {result} = await query.select(['bagian',{idBagian:req.params.idBagian}]);
            res.render('index',{page : 'bagian/edit',data : result[0],dataMenu:'bagian',dataDropDown:'karyawan'});
                
        });

        router.put('/', async (req,res)=>{
            const regex = /[^,\d]/g;
            req.body.uangMakan = req.body.uangMakan.replace(regex,"");
            req.body.insentif = req.body.insentif.replace(regex,"");
            const idBagian = req.body.idBagian;
            delete req.body.idBagian;
            
            const {result} = await query.update(['bagian',req.body,{idBagian}]);
            res.redirect('/bagian');
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

            const {result} = await query.delete1(['bagian',{idBagian:req.body.idBagian}]);
            console.log(req.body)
            if(result.affectedRows>0){
                req.flash('success','Data berhasil dihapus..');
                res.redirect('/bagian');
            }else{
                req.flash('error','Data Gagal dihapus..');
                res.redirect('/bagian');
            }
        });
        
        return router
}
 

