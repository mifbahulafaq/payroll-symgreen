let Gaji = require('../model/m_penggajian').gaji;
let Pegawai = require('../model/m_penggajian').pegawai;

module.exports = function(app){
    app.get('/',(req,res,next)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        const thnKemarin = new Date().getFullYear() - 1;
        const tglKemarin = new Date(thnKemarin,11,31);
        const tglKemarinParse = Date.parse(tglKemarin);

        Pegawai.find({tglMasuk : {$gt : tglKemarinParse}}).select('id').exec((err,dataPegawai2)=>{
            Pegawai.find({}).select('id').exec((err,dataPegawai)=>{
                Gaji.find().select('tglPenggajian').sort({tglPenggajian : -1}).limit(1).exec((err,dataGaji)=>{

                    let tanggal = (dataGaji.length > 0)? dataGaji[0].tglPenggajian : '';

                    Gaji.find({tglPenggajian : tanggal}).select('gajiDiTerimah').exec((err,dataGaji2)=>{
                        let semuaGajiPeg = 0;
                        dataGaji2.forEach(e=>{
                            semuaGajiPeg += e.gajiDiTerimah;
                        })
                        
                        res.render('index',{
                            page : 'dashboard',
                            tglPenggajian : tanggal,
                            semuaGajiPeg : semuaGajiPeg,
                            jumPeg : dataPegawai.length,
                            pegrThnIni : dataPegawai2.length
                        });
                    })
                    
                })
            })
        })

        
        
    })

}