let Kasbon = require('../model/m_penggajian').kasbon;
let Pegawai = require('../model/m_penggajian').pegawai;
const Gaji = require('../model/m_penggajian').gaji;

module.exports = function(app,kasbon){
        //Create
        kasbon.get('/tambah',(req,res)=>{
            if(!req.session.login){
                req.flash('error','Anda harus Login terlebih dahulu')
                throw res.redirect('/auth/login')
            }

                res.render('index',{page : 'kasbon/tambah'})
        })
       
            
        kasbon.post('/tambah',(req,res)=>{
            if(!req.session.login){
                req.flash('error','Anda harus Login terlebih dahulu')
                throw res.redirect('/auth/login')
            }
            
            Pegawai.findOne({nip : req.body.nip}, (err,dataPegawai)=>{
                if(err) res.end('error');
                if(!dataPegawai){
                    req.flash('error','Pegawai dengan NIP ('+req.body.nip+') tidak ada..')
                    res.redirect('/kasbon/tambah')
                }else{
                    
                    Kasbon.findOne({idPegawai : dataPegawai.id, status : 'Belum Lunas'},(err,data)=>{
                        if(data){
                            req.flash('error','Data Kasbon dengan NIP ('+req.body.nip+') sudah ada dan belum melunasi..')
                            return res.redirect('/kasbon/tambah')
                        }
                        const arrKasbon = req.body.tglKasbon.split('-');
                        const jmlKasbon = req.body.jmlKasbon.replace(/[^,\d]/g, '');
                        let dataKasbon = new Kasbon();
                        dataKasbon.idPegawai = dataPegawai.id;
                        dataKasbon.jmlKasbon = jmlKasbon;
                        dataKasbon.sisaKasbon = jmlKasbon;
                        dataKasbon.status = 'Belum Lunas';
                        dataKasbon.tglKasbon = Date.parse(new Date(arrKasbon[0],arrKasbon[1]-1,arrKasbon[2]));
    
                        dataKasbon.save((err,data)=>{
                            if(!data){
                                req.flash('error','Data gagal di tambahkan..')
                                res.redirect('/kasbon/data')
                            }else{
                                req.flash('success','satu data berhasil di tambahkan..')
                                res.redirect('/kasbon/data')
                            }
                        })
                    })

                
                }
                
            })
        })
    
        //Read    
        kasbon.get('/data',(req,res)=>{
            if(!req.session.login){
                req.flash('error','Anda harus Login terlebih dahulu')
                throw res.redirect('/auth/login')
            }
            
            Kasbon.find().populate('idPegawai').exec((err,data)=>{
                if(err) return res.send(err)
                res.render('index',{data : data, page : 'kasbon/data'})
            })
        })
        

        //Update
        kasbon.get('/edit/:id',(req,res)=>{
            if(!req.session.login){
                req.flash('error','Anda harus Login terlebih dahulu')
                throw res.redirect('/auth/login')
            }
            
            Kasbon.findById({_id : req.params.id}).populate('idPegawai').exec((err,dataKasbon)=>{
                if(!dataKasbon){
                    res.send(err)
                }else{
                res.render('index',{page : 'kasbon/edit' , data : dataKasbon})
                }
                
                
            })
                
        })

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
        kasbon.delete('/',(req,res)=>{
            if(!req.session.login){
                req.flash('error','Anda harus Login terlebih dahulu')
                throw res.redirect('/auth/login')
            }
            
            Kasbon.deleteOne({_id : req.body.id},err=> {

                if(err){
                    req.flash('error','data gagal di hapus..')
                    res.redirect('/kasbon/data')
                }else{
                    req.flash('success','satu data berhasil di hapus..')
                    res.redirect('/kasbon/data')
                }
                    
            })
                
        })


        kasbon.put('/bayar',(req,res)=>{
            if(!req.session.login){
                req.flash('error','Anda harus Login terlebih dahulu')
                throw res.redirect('/auth/login')
            }
            
            Kasbon.findById(req.body.id,(err,dataKasbon)=>{
                Gaji.findOne({idPegawai : dataKasbon.idPegawai, status : 'Belum Diterima', potKasbon : dataKasbon.bayar},(err,dataGaji)=>{
                    if(req.body.bayar.replace(/[^,\d]/g, '') > dataKasbon.sisaKasbon){
                        req.flash('error','Nominal yang anda bayarkan melebihi sisa kasbon');
                        return res.redirect('/kasbon/data');
                    }
                    dataKasbon.bayar = Number(req.body.bayar.replace(/[^,\d]/g, ''));
                    dataKasbon.save((err,data)=>{
                        if(err) return res.send(err);
                        if(dataGaji){
                            dataGaji.potKasbon = Number(req.body.bayar.replace(/[^,\d]/g, ''));
                            dataGaji.gajiDiTerimah = dataGaji.totGaji - req.body.bayar.replace(/[^,\d]/g, '');
                            dataGaji.save(err=>{
                                if(err) return res.send(err);
                            })
                        }
                        req.flash('success',`Berhasil melakukan pembayaran`);
                        res.redirect('/kasbon/data');
                    })
                })
            })
        })

        kasbon.put('/lunasi',(req,res)=>{
            if(!req.session.login){
                req.flash('error','Anda harus Login terlebih dahulu')
                throw res.redirect('/auth/login')
            }
            
            Kasbon.findById(req.body.id,(err,dataKasbon)=>{
                Gaji.findOne({idPegawai : dataKasbon.idPegawai, status : 'Belum Diterima', potKasbon : dataKasbon.bayar},(err,dataGaji)=>{
                    dataKasbon.sisaKasbon = 0;
                    dataKasbon.status = 'Lunas';
                    dataKasbon.bayar = 0;
                    dataKasbon.save((err,data)=>{
                        if(err) return res.send(err);
                        if(dataGaji){
                            dataGaji.potKasbon = 0;
                            dataGaji.gajiDiTerimah = dataGaji.totGaji;
                            dataGaji.save(err=>{
                                if(err) return res.send(err);
                            })
                        }
                        req.flash('success',`Data dengan NIP (${req.body.nip}) telah di Lunasi`);
                        res.redirect('/kasbon/data');
                    })
                })
            })
        })
        
 
    
        app.use('/kasbon',kasbon)

}
 

