const Lembur = require('../model/m_penggajian').lembur;
const Pegawai = require('../model/m_penggajian').pegawai;

module.exports = function(app,lembur){

    lembur.post('/search',(req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        
        const inputSearch = req.body.inputSearch.split('-');
        const tanggal = new Date(inputSearch[0],inputSearch[1]-1,inputSearch[2]);
        console.log(Date.parse(tanggal))
        // let find = { "$expr": { "$gt": [ { "$size": {  "$regexFindAll": { "input": {"$toString": "$tanggal"}, "regex": req.body.inputSearch } }},0]} };
        Lembur.find({tanggal : Date.parse(tanggal)}).populate('idPegawai').exec((err,dataLembur)=>{
            if(err) return res.send(err);
                return res.render('index',{dataL : dataLembur, tanggal : tanggal, page : 'lembur/data'});
            // res.render('index',{data : datalembur, page : 'lembur/ubah'});
            
        })
    })

    lembur.get('/data',(req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        
        let recentDate = new Date()
        let tanggal = new Date(recentDate.getFullYear(),recentDate.getMonth(),recentDate.getDate());
        // let find = { "$expr": { "$gt": [ { "$size": {  "$regexFindAll": { "input": {"$toString": "$tanggal"}, "regex": tanggal.toJSON().slice(0,10) } }},0]} };

        Lembur.find({tanggal : Date.parse(tanggal)}).populate('idPegawai').exec((err,datalembur)=>{
            
            return res.render('index',{dataL : datalembur, tanggal : tanggal, page : 'lembur/data'});
        })
    })

    lembur.post('/',(req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        
        Pegawai.findOne({nip : req.body.nip},(err,dataPegawai)=>{
            if(!dataPegawai) {
                req.flash('error','Pegawai dengan NIP ('+req.body.nip+') tidak ada..')
                return res.redirect('/lembur/data')
            }

            // res.send(req.body)

            const tanggal = req.body.tanggal.split('.');
            const jamMasuk = req.body.jamMasuk.split(':');
            const jamPulang = req.body.jamPulang.split(':');

            const tanggalParse = new Date(tanggal[0],tanggal[1],tanggal[2]);
            const jamMasukParse = new Date(tanggal[0],tanggal[1],tanggal[2],jamMasuk[0],jamMasuk[1]);
            const jamPulangParse = new Date(tanggal[0],tanggal[1],tanggal[2],jamPulang[0],jamPulang[1]);
            const lembur = new Lembur({
                idPegawai : dataPegawai.id,
                tanggal : Date.parse(tanggalParse),
                jamMasuk : Date.parse(jamMasukParse),
                jamPulang : Date.parse(jamPulangParse),
                ket : req.body.ket
            })
            lembur.save((err,data)=>{
                if(err) return res.send(err);
                res.redirect('/lembur/data');
            })
        })





    })

    lembur.put('/',(req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        
        const tanggal = req.body.tanggal.split('.');
        const jamMasuk = req.body.jamMasuk.split(':');
        const jamPulang = req.body.jamPulang.split(':');

        const jamMasukParse = new Date(tanggal[0],tanggal[1],tanggal[2],jamMasuk[0],jamMasuk[1]);
        const jamPulangParse = new Date(tanggal[0],tanggal[1],tanggal[2],jamPulang[0],jamPulang[1]);


        Lembur.findById(req.body.id,(err,datalembur)=>{
            datalembur.sift = req.body.sift;
            datalembur.status = req.body.status;
            datalembur.jamMasuk = jamMasukParse;
            datalembur.jamPulang = jamPulangParse;
            datalembur.ket = req.body.ket;

            datalembur.save((err,data)=>{
                if(err) return res.send(err);
                req.flash('success','satu data berhasil di ubah');
                res.redirect('/lembur/data');
            })
        })
    })

    lembur.delete('/',(req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        
        Lembur.deleteOne({_id : req.body.id},(err,data)=>{
            if(err) return res.send(err);
            res.redirect('/lembur/data');
        })
    })

    app.use('/lembur',lembur)

}