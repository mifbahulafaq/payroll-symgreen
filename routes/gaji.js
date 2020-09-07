const ejs = require('ejs');
const path = require('path');
const Gaji = require('../model/m_penggajian').gaji;
const Pegawai = require('../model/m_penggajian').pegawai;
const Absensi = require('../model/m_penggajian').absensi;
const Kasbon = require('../model/m_penggajian').kasbon;
const Lembur = require('../model/m_penggajian').lembur;
const pdf = require('html-pdf');

module.exports = function(app,gaji){

    gaji.post('/search',(req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        
        const inputSearch = req.body.inputSearch.split('-');
        const tanggal = new Date(inputSearch[0],inputSearch[1]-1,inputSearch[2]);
        // let find = { "$expr": { "$gt": [ { "$size": {  "$regexFindAll": { "input": {"$toString": "$tanggal"}, "regex": tanggal.toJSON().slice(0,10) } }},0]} };

        Gaji.find({tglPenggajian : Date.parse(tanggal)}).populate({ path : 'idPegawai', populate : 'idBagian'}).exec((err,dataGaji)=>{

            Pegawai.find({},(err,dataPegawai)=>{
                return res.render('index',{dataG : dataGaji, dataP : dataPegawai, tanggal : tanggal, page : 'gaji/data'});
            })
        })
    })
    gaji.get('/data',(req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        
        let recentDate = new Date()
        let tanggal = new Date(recentDate.getFullYear(),recentDate.getMonth(),recentDate.getDate());
        // let find = { "$expr": { "$gt": [ { "$size": {  "$regexFindAll": { "input": {"$toString": "$tanggal"}, "regex": tanggal.toJSON().slice(0,10) } }},0]} };

        Gaji.find({tglPenggajian : Date.parse(tanggal)}).populate({ path : 'idPegawai', populate : 'idBagian'}).exec((err,dataGaji)=>{

            Pegawai.find({},(err,dataPegawai)=>{
                return res.render('index',{dataG : dataGaji, dataP : dataPegawai, tanggal : tanggal, page : 'gaji/data'});
            })
        })
    })

    gaji.post('/', (req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        
        const sejam = 3600000;
        const sehari = 86400000;
        const mulaiTglHit = req.body.mulaiTglHit.split('-');
        const akhirTglHit = req.body.akhirTglHit.split('-');
        const tglPenggajian = req.body.tanggal.split('.');
        const uangTambahan = req.body.uangTambahan.replace(/[^,\d]/g, '');

        const tglPenggajianParse = Date.parse(new Date(tglPenggajian[0],tglPenggajian[1],tglPenggajian[2]));
        const gtTglParse = Date.parse(new Date(mulaiTglHit[0],mulaiTglHit[1]-1,mulaiTglHit[2]-1));
        const ltTglParse = Date.parse(new Date(akhirTglHit[0],akhirTglHit[1]-1,Number(akhirTglHit[2])+1));
        const akhirTglParse = Date.parse(new Date(akhirTglHit[0],akhirTglHit[1]-1,akhirTglHit[2]));
        const jmlhHariInput = (akhirTglParse - gtTglParse) / sehari;
        Gaji.findOne({idPegawai : req.body.id, status : 'Belum Diterima'}).populate('idPegawai').exec((err,dataGaji)=>{
            if(dataGaji){
                const tglPenggajian = new Date(dataGaji.tglPenggajian);

                req.flash('error',`Gagal Menambahkan Data,<br> Gaji ${dataGaji.idPegawai.nama} pada tanggal <strong>${tglPenggajian.getDate()}/${tglPenggajian.getMonth()+1}/${tglPenggajian.getFullYear()}</strong> Belum diterima`);
                return res.redirect('/gaji/data');
            }
            Pegawai.findById(req.body.id, (err,dataPegawai)=>{
                Kasbon.findOne({idPegawai : req.body.id, status : 'Belum Lunas'},(err,dataKasbon)=>{
                    Lembur.find({idPegawai : req.body.id, tanggal : {$gt : gtTglParse, $lt : ltTglParse}},(err,dataLembur)=>{
                        Absensi.find({idPegawai : req.body.id, tanggal : {$gt : gtTglParse, $lt : ltTglParse}},(err,dataAbsensi)=>{
    
                            let jmlJamLembur = 0;
                            let jmlhAbsMasuk = 0;
                            let potKasbon = 0;
                            let uangLembur = 0;
    
                            if(err) return res.send(err);
                            if(jmlhHariInput != dataAbsensi.length){
                                req.flash('error',`Absensi (${req.body.namaHide}) tidak lengkap!!, Lengkapi terlebih dahulu Absensi pegawai`)
                                return res.redirect('/gaji/data')
                            }                        //jml Masuk Kerja
                            dataAbsensi.forEach(e =>{
                                if(e.status == 'masuk') jmlhAbsMasuk += 1;
                            });
    
                            //lemburr
                            if(dataLembur.length > 0){
                                dataLembur.forEach(e=>{
                                    jmlJamLembur += (e.jamPulang -  e.jamMasuk) / sejam;
                                    jmlJamLembur = Math.floor(jmlJamLembur);
                                })
                                uangLembur = (dataPegawai.gajiPokok / 7) * jmlJamLembur;
                            }
                            //kasbon
                            //kasbon
                            if(dataKasbon){
                                if(dataKasbon.bayar > 0){
                                    potKasbon = dataKasbon.bayar;
                                } 
                            }
                            
                            let totGaji = ((dataPegawai.gajiPokok + dataPegawai.insentif) * jmlhAbsMasuk) + uangLembur + Number(uangTambahan);
                            let gajiDiTerimah = totGaji - potKasbon;
                            
                             const gaji = new Gaji({
                                idPegawai : req.body.id,
                                tglPenggajian : tglPenggajianParse,
                                mulaiTglHit : Date.parse(new Date(mulaiTglHit[0],mulaiTglHit[1]-1,mulaiTglHit[2])),
                                akhirTglHit : Date.parse(new Date(akhirTglHit[0],akhirTglHit[1]-1,akhirTglHit[2])),
                                jumHariMasuk : jmlhAbsMasuk,
                                jumJamLembur : jmlJamLembur,
                                uangTambahan : Number(uangTambahan),
                                ket : req.body.ket,
                                potKasbon : potKasbon,
                                uangLembur : Math.floor(uangLembur),
                                totGaji : Math.floor(totGaji),
                                gajiDiTerimah : Math.floor(gajiDiTerimah)
                            });
                            gaji.save((err,data)=>{
                                if(err) return res.send(err);
                                req.flash('success','Satu data berhasil di tambahkan');
                                res.redirect('/gaji/data')
                            })
        
                        })
                    })
                })
            })
        })
    })

    gaji.put('/', (req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        
        Gaji.findById(req.body.id,(err,dataGaji)=>{
            const sejam = 3600000;
            const sehari = 86400000;
            const mulaiTglHit = req.body.mulaiTglHit.split('-');
            const akhirTglHit = req.body.akhirTglHit.split('-');
            const uangTambahan = req.body.uangTambahan.replace(/[^,\d]/g, '');

            const gtTglParse = Date.parse(new Date(mulaiTglHit[0],mulaiTglHit[1]-1,mulaiTglHit[2]-1));
            const ltTglParse = Date.parse(new Date(akhirTglHit[0],akhirTglHit[1]-1,Number(akhirTglHit[2])+1));
            const akhirTglParse = Date.parse(new Date(akhirTglHit[0],akhirTglHit[1]-1,akhirTglHit[2]));
            const jmlhHariInput = (akhirTglParse - gtTglParse) / sehari;

            Pegawai.findById(dataGaji.idPegawai, (err,dataPegawai)=>{
                Kasbon.findOne({idPegawai : dataGaji.idPegawai, status : 'Belum Lunas'},(err,dataKasbon)=>{
                    Lembur.find({idPegawai : dataGaji.idPegawai, tanggal : {$gt : gtTglParse, $lt : ltTglParse}},(err,dataLembur)=>{
                        Absensi.find({idPegawai : dataGaji.idPegawai, tanggal : {$gt : gtTglParse, $lt : ltTglParse}},(err,dataAbsensi)=>{
                            let jmlJamLembur = 0;
                            let jmlhAbsMasuk = 0;
                            let potKasbon = 0;
                            let uangLembur = 0;
    
                            if(err) return res.send(err);
                            if(jmlhHariInput != dataAbsensi.length){
                                req.flash('error',`Absensi Pegawai dengan Nama (${req.body.namaHide}) ada yang tidak ada dalam Tanggal yang anda Masukkan!!, Lengkapi terlebih dahulu Absensi pegawai`)
                                return res.redirect('/gaji/data')
                            }                        //jml Masuk Kerja
                            dataAbsensi.forEach(e =>{
                                if(e.status == 'masuk') jmlhAbsMasuk += 1;
                            });
    
                            //lemburr
                            if(dataLembur.length > 0){
                                dataLembur.forEach(e=>{
                                    jmlJamLembur += (e.jamPulang -  e.jamMasuk) / sejam;
                                    jmlJamLembur = Math.floor(jmlJamLembur);
                                })
                                uangLembur = (dataPegawai.gajiPokok / 7) * jmlJamLembur;
                            }
                            //kasbon
                            if(dataKasbon){
                                if(dataKasbon.bayar > 0){
                                    potKasbon = dataKasbon.bayar;
                                } 
                            }
                            
                            let totGaji = ((dataPegawai.gajiPokok + dataPegawai.insentif) * jmlhAbsMasuk) + uangLembur + Number(uangTambahan);
                            let gajiDiTerimah = totGaji - potKasbon;

                            dataGaji.mulaiTglHit = Date.parse(new Date(mulaiTglHit[0],mulaiTglHit[1]-1,mulaiTglHit[2])),
                            dataGaji.akhirTglHit = Date.parse(new Date(akhirTglHit[0],akhirTglHit[1]-1,akhirTglHit[2])),
                            dataGaji.jumHariMasuk = jmlhAbsMasuk,
                            dataGaji.jumJamLembur = jmlJamLembur,
                            dataGaji.uangTambahan = Number(uangTambahan),
                            dataGaji.ket = req.body.ket,
                            dataGaji.potKasbon = potKasbon,
                            dataGaji.uangLembur = Math.floor(uangLembur),
                            dataGaji.totGaji = Math.floor(totGaji),
                            dataGaji.gajiDiTerimah = Math.floor(gajiDiTerimah);

                            dataGaji.save((err,data)=>{
                                if(err) return res.send(err);
                                req.flash('success','Satu data berhasil di Ubah');
                                res.redirect('/gaji/data')
                            })
        
                        })
                    })
                })
            })
        })



    })

    gaji.delete('/',(req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        
        Gaji.deleteOne({_id : req.body.id},(err,data)=>{
            if(err) return res.send(err);
            req.flash('success',`Satu Data berhasil dihapus`);
            res.redirect('/gaji/data');
        })
    })

    gaji.get('/laporan',(req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        
        let recentDate = new Date()
        let tanggal = new Date(recentDate.getFullYear(),recentDate.getMonth(),recentDate.getDate());
        // let find = { "$expr": { "$gt": [ { "$size": {  "$regexFindAll": { "input": {"$toString": "$tanggal"}, "regex": tanggal.toJSON().slice(0,10) } }},0]} };

        Gaji.find({tglPenggajian : Date.parse(tanggal)}).populate({ path : 'idPegawai', populate : 'idBagian'}).exec((err,dataGaji)=>{
            if(err) return res.send(err)
            res.render('index',{dataG : dataGaji, tanggal : tanggal, page : 'gaji/laporan'});
        })
    })

    gaji.post('/laporan_search',(req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        
        const inputSearch = req.body.inputSearch.split('-');
        const tanggal = new Date(inputSearch[0],inputSearch[1]-1,inputSearch[2]);
        // let find = { "$expr": { "$gt": [ { "$size": {  "$regexFindAll": { "input": {"$toString": "$tanggal"}, "regex": tanggal.toJSON().slice(0,10) } }},0]} };

        Gaji.find({tglPenggajian : Date.parse(tanggal)}).populate({ path : 'idPegawai', populate : 'idBagian'}).exec((err,dataGaji)=>{
            if(err) return res.send(err)
            res.render('index',{dataG : dataGaji, tanggal : tanggal, page : 'gaji/laporan'});
        })
    })
    gaji.post('/slip',(req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        
        Gaji.findById(req.body.idGaji).populate({ path : 'idPegawai', populate : 'idBagian'}).exec((err,dataGaji)=>{
            if(err) return res.send(err);
            Kasbon.findOne({idPegawai : req.body.idPegawai, status : 'Belum Lunas'},(err,dataKasbon)=>{
                const img = path.join(__dirname,'../public/dist/img/').replace(/\\/g,'/');
                if(dataGaji.status == 'Belum Diterima'){
                    dataGaji.status = 'Diterima';
                    dataGaji.save(err=>{
                        if(err) return res.send(err)
                        if(dataKasbon){
                            if(dataKasbon.bayar > 0){
                                dataKasbon.sisaKasbon = dataKasbon.sisaKasbon - dataKasbon.bayar;
                                dataKasbon.bayar = 0;
                                if(dataKasbon.sisaKasbon == 0) dataKasbon.status = 'Lunas';
                                dataKasbon.save(err=>{
                                    if(err) return res.send(err);
                                })
                            }
                        }
    
                    })
                }

                res.render(path.join(__dirname,'../views/gaji/cetak_slip.ejs'),{dataG : dataGaji},(err,html)=>{
                    console.log(img)
                    const option = {
                        format : 'Letter',
                        base : 'file:///'+img
                    }
                    pdf.create(html,option).toFile('./views/gaji/slip.pdf',(err,path)=>{
                        const option = {headers : {'Content-Type': 'application/pdf'}}
                        // res.attachment('slip')
                        res.sendFile(path.filename,option);
                    })
                })

            })

        })
    })

    gaji.get('/cetak_laporan/:tgl',(req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        
        Gaji.find({tglPenggajian : req.params.tgl}).populate({path : 'idPegawai', populate : 'idBagian'}).exec((err,dataGaji)=>{
            ejs.renderFile(path.join(__dirname,'../views/gaji/cetak_laporan.ejs'),{dataG : dataGaji, tglPenggajian : Number(req.params.tgl)},(err,html)=>{
                const option = {
                    format : 'Letter',
                    orientation: "landscape"
                }
                pdf.create(html,option).toFile('./views/gaji/laporan_gaji.pdf',(err,path)=>{
                    const option = {headers : {'Content-Type': 'application/pdf'}}
                    // res.attachment('slip')
                    res.sendFile(path.filename,option);
                })
            })

        })
    })


    app.use('/gaji',gaji)

}