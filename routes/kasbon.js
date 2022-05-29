const query = require('../config/query');
const moment = require('moment');

module.exports = function(router){
        //Create
        router.get('/tambah',(req,res)=>{
            res.render('index',{page : 'kasbon/tambah',dataMenu:'kasbon'})
        })
       
            
        router.post('/', async (req,res)=>{
            console.log(req.body)
            const arr = ['kasbon',{nik:req.body.nik},{statusKas:'Belum Lunas'}];
            const sql = 'SELECT * FROM ?? WHERE ? AND ?';
            const {result:kasbon} = await query.query2(false,sql,arr);

            if(kasbon.length>0){
                req.flash('error','Data Kasbon dengan NIK ('+req.body.nik+') sudah ada dan belum dilunasi..')
                return res.redirect('/kasbon/tambah')
            }

            const {result:karyawan} = await query.select(['karyawan',{nik:req.body.nik}]);
            if(karyawan<1){
                req.flash('error','Pegawai dengan NIK ('+req.body.nik+') tidak ada..');
                return res.redirect('/kasbon/tambah');
            }

            const regex = /[^,\d]/g;
            req.body.jumlah = req.body.jumlah.replace(regex, '');
            req.body.sisa = req.body.jumlah;
            req.body.statusKas = 'Belum Lunas';
            const {result:insertKas} = await query.insert('kasbon',req.body);
            req.flash('success','satu data berhasil di tambahkan..');
            res.redirect('/kasbon');
        })
    
        //Read    
        router.get('/', async (req,res)=>{
            const obj = {
                slc : '*',
                frm:'kasbon',
                jn :'karyawan',
                fkFrm :'nik',
                pkJn : 'nik'
            }
            const {result} = await query.slcJn(obj)
            result.forEach(e => {
                e.kasbon.tgl = moment(e.kasbon.tgl).format('DD-MM-YYYY'); 
            });
            res.render('index',{data : result, page : 'kasbon/data',dataMenu:'kasbon'});
        })
        

        //Update
        // kasbon.get('/edit/:id',(req,res)=>{
        //     if(!req.session.login){
        //         req.flash('error','Anda harus Login terlebih dahulu')
        //         throw res.redirect('/auth/login')
        //     }
            
        //     Kasbon.findById({_id : req.params.id}).populate('idPegawai').exec((err,dataKasbon)=>{
        //         if(!dataKasbon){
        //             res.send(err)
        //         }else{
        //         res.render('index',{page : 'kasbon/edit' , data : dataKasbon})
        //         }
                
                
        //     })
                
        // })

        // kasbon.put('/',(req,res)=>{
        //     Kasbon.findById(req.body.id).populate('idPegawai').exec((err,kasbon)=>{
        //         if(err) return res.send(err)
        //         const arrKasbon = req.body.tglKasbon.split('/')
        //         kasbon.jmlKasbon = req.body.jmlKasbon.replace(/[^,\d]/g, '');
        //         kasbon.sisaKasbon = req.body.jmlKasbon.replace(/[^,\d]/g, '');
        //         kasbon.status = 'Belum Lunas';
        //         kasbon.tglKasbon = Date.parse(new Date(arrKasbon[0],arrKasbon[1]-1,arrKasbon[2]));

        //         kasbon.save((err,data)=>{
        //         if(err) return res.send(err)
        //         req.flash('success','Data Kasbon dengan nip ('+data.idPegawai.nip+') Berhasil di ubah..')
        //         res.redirect('/kasbon/data')
        //         })

                
        //     })
        // })

        
        //Delete
        // kasbon.delete('/',(req,res)=>{
        //     if(!req.session.login){
        //         req.flash('error','Anda harus Login terlebih dahulu')
        //         throw res.redirect('/auth/login')
        //     }
            
        //     Kasbon.deleteOne({_id : req.body.id},err=> {

        //         if(err){
        //             req.flash('error','data gagal di hapus..')
        //             res.redirect('/kasbon/data')
        //         }else{
        //             req.flash('success','satu data berhasil di hapus..')
        //             res.redirect('/kasbon/data')
        //         }
                    
        //     })
                
        // })


        router.put('/bayar', async (req,res)=>{

            const regex = /[^,\d]/g;
            const idKasbon = req.body.idKasbon;
            const bayar = req.body.bayar.replace(regex, '');
            const {result} = await query.update(['kasbon',{bayar},{idKasbon}]);
            console.log(result)
            req.flash('success',`Berhasil melakukan pembayaran`);
            res.redirect('/kasbon');
            // Kasbon.findById(req.body.id,(err,dataKasbon)=>{
            //     Gaji.findOne({idPegawai : dataKasbon.idPegawai, status : 'Belum Diterima', potKasbon : dataKasbon.bayar},(err,dataGaji)=>{
            //         if(req.body.bayar.replace(/[^,\d]/g, '') > dataKasbon.sisaKasbon){
            //             req.flash('error','Nominal yang anda bayarkan melebihi sisa kasbon');
            //             return res.redirect('/kasbon/data');
            //         }
            //         dataKasbon.bayar = Number(req.body.bayar.replace(/[^,\d]/g, ''));
            //         dataKasbon.save((err,data)=>{
            //             if(err) return res.send(err);
            //             if(dataGaji){
            //                 dataGaji.potKasbon = Number(req.body.bayar.replace(/[^,\d]/g, ''));
            //                 dataGaji.gajiDiTerimah = dataGaji.totGaji - req.body.bayar.replace(/[^,\d]/g, '');
            //                 dataGaji.save(err=>{
            //                     if(err) return res.send(err);
            //                 })
            //             }
            //             req.flash('success',`Berhasil melakukan pembayaran`);
            //             res.redirect('/kasbon/data');
            //         })
            //     })
            // })
        })

        router.put('/lunasi', async (req,res)=>{

            const obj = {
                sisa : 0,
                statusKas : 'Lunas',
                bayar : 0
            }
            const {result} = await query.update(['kasbon',obj,{idKasbon:req.body.idKasbon}]);
            req.flash('success',`Data dengan NIK (${req.body.nik}) telah di Lunasi`);
            res.redirect('/kasbon');

            // Kasbon.findById(req.body.id,(err,dataKasbon)=>{
            //     Gaji.findOne({idPegawai : dataKasbon.idPegawai, status : 'Belum Diterima', potKasbon : dataKasbon.bayar},(err,dataGaji)=>{
            //         dataKasbon.sisaKasbon = 0;
            //         dataKasbon.status = 'Lunas';
            //         dataKasbon.bayar = 0;
            //         dataKasbon.save((err,data)=>{
            //             if(err) return res.send(err);
            //             if(dataGaji){
            //                 dataGaji.potKasbon = 0;
            //                 dataGaji.gajiDiTerimah = dataGaji.totGaji;
            //                 dataGaji.save(err=>{
            //                     if(err) return res.send(err);
            //                 })
            //             }
            //             req.flash('success',`Data dengan NIP (${req.body.nip}) telah di Lunasi`);
            //             res.redirect('/kasbon/data');
            //         })
            //     })
            // })
        })
        
        return router;

}
 

