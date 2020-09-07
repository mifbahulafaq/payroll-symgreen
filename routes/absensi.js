const Absensi = require('../model/m_penggajian').absensi;
const Pegawai = require('../model/m_penggajian').pegawai;

module.exports = function(app,absensi){

    absensi.post('/search',(req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }

        const inputSearch = req.body.inputSearch.split('-');
        const tanggal = new Date(inputSearch[0],inputSearch[1]-1,inputSearch[2]);
        // let find = { "$expr": { "$gt": [ { "$size": {  "$regexFindAll": { "input": {"$toString": "$tanggal"}, "regex": req.body.inputSearch } }},0]} };
        Absensi.find({tanggal : Date.parse(tanggal)}).populate('idPegawai').exec((err,dataAbsensi)=>{
            if(err) return res.send(err)
                Pegawai.find().select('nama').select('_id').select('nip').exec((err,dataPegawai)=>{
                    if(err) return res.send(err);
                    return res.render('index',{dataA : dataAbsensi, dataP : dataPegawai, tanggal : tanggal, page : 'absensi/data'});
                })
            // res.render('index',{data : dataAbsensi, page : 'absensi/ubah'});
            
        })
    })

    absensi.get('/data',(req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }

        let recentDate = new Date()
        let tanggal = new Date(recentDate.getFullYear(),recentDate.getMonth(),recentDate.getDate());
        // let find = { "$expr": { "$gt": [ { "$size": {  "$regexFindAll": { "input": {"$toString": "$tanggal"}, "regex": tanggal.toJSON().slice(0,10) } }},0]} };

        Absensi.find({tanggal : Date.parse(tanggal)}).populate('idPegawai').exec((err,dataAbsensi)=>{

            Pegawai.find({},(err,dataPegawai)=>{
                return res.render('index',{dataA : dataAbsensi, dataP : dataPegawai, tanggal : tanggal, page : 'absensi/data'});
            })
        })
    })

    absensi.post('/',(req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        
        if(typeof(req.body.id) == 'object' ){
            for(let i = 0; i<req.body.id.length; i++){
                if(req.body.sift[i] != '' && req.body.status[i] != ''){
                    const tanggal = req.body.tanggal[i].split('.');
                    const dateParse = new Date(tanggal[0],tanggal[1],tanggal[2]);
                    const absensi = new Absensi({
                        idPegawai : req.body.id[i],
                        tanggal : Date.parse(dateParse),
                        sift : req.body.sift[i],
                        status : req.body.status[i],
                        jamMasuk : req.body.jamMasuk[i],
                        jamPulang : req.body.jamPulang[i],
                        ket : req.body.ket[i]
                    })
                    absensi.save((err,data)=>{
                        if(err) return res.send(err);
                    })
                }
            }
            return res.redirect('/absensi/data');
        }else{
            if(req.body.sift == '' || req.body.status == '') return res.redirect('/absensi/data');
            console.log(req.body)
            const tanggal = req.body.tanggal.split('.');
            const dateParse = new Date(tanggal[0],tanggal[1],tanggal[2]);
            const absensi = new Absensi({
                idPegawai : req.body.id,
                tanggal : Date.parse(dateParse),
                sift : req.body.sift,
                status : req.body.status,
                jamMasuk : req.body.jamMasuk,
                jamPulang : req.body.jamPulang,
                ket : req.body.ket
            })
            absensi.save((err,data)=>{
                if(err) return res.send(err);
                res.redirect('/absensi/data');
            })
        }




    })

    absensi.put('/',(req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        
        Absensi.findById(req.body.id,(err,dataAbsensi)=>{
            dataAbsensi.sift = req.body.sift;
            dataAbsensi.status = req.body.status;
            dataAbsensi.jamMasuk = req.body.jamMasuk;
            dataAbsensi.jamPulang = req.body.jamPulang;
            dataAbsensi.ket = req.body.ket;

            dataAbsensi.save((err,data)=>{
                if(err) return res.send(err);
                req.flash('success','satu data berhasil di ubah');
                res.redirect('/absensi/data');
            })
        })
    })

    absensi.get('/delete/:id',(req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        
        Absensi.deleteOne({_id : req.params.id},(err,data)=>{
            if(err) return res.send(err);
            res.redirect('/absensi/data');
        })
    })

    app.use('/absensi',absensi)

}