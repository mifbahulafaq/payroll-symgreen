const ejs = require('ejs');
const path = require('path');
const moment = require('moment');
const pdf = require('html-pdf');
const query = require('../config/query');

module.exports = function(router){

    async function queryGaji(tgl){
        const arrSqlGaji = ['gaji','gaji','nik','karyawan','nik',{tgl:tgl}];
        const arrSqlBagian = ['bagian','karyawan','idBagian','bagian','idBagian'];
        const arrSql = ['karyawan',...arrSqlBagian,...arrSqlGaji];
        const sqlJoinGaji = ' LEFT JOIN ?? ON ??.?? = ??.?? AND ?';
        const sqlJoinBagian = 'INNER JOIN ?? ON ??.?? = ??.??';
        const sql = `SELECT * FROM ((?? ${sqlJoinBagian})${sqlJoinGaji})`;

        const {result} = await query.query2(true,sql,arrSql);
        return result;
        
    }

    async function hitPeriode(body){
        const arrBagian = [
            ['bagian.namaBagian','karyawan.upahPerHari','bagian.uangMakan','bagian.insentif'],
            'karyawan',
            'bagian',
            'karyawan','idBagian',
            'bagian',
            'idBagian',
            {nik:body.nik}
        ];
        const arrkasbon = ['kasbon',{statusKas:'Belum Lunas'},{nik:body.nik}];
        const arrKehadiran = [
            ['tgl','statusKeh','jamLembur'],
            'kehadiran',
            'tgl'
            ,body.mulaiTglHit,
            'tgl',
            body.akhirTglHit,
            {nik:body.nik}
        ]
        const arr = [...arrKehadiran,...arrkasbon,...arrBagian]; 
        const sqlJoinBagian = 'SELECT ?? FROM ?? INNER JOIN ?? ON ??.?? = ??.?? WHERE ?';
        const sqlKasbon = `SELECT * FROM ?? WHERE ? AND ? `;
        const sqlKehadiran = `SELECT ?? FROM ?? WHERE ?? >= ? AND ?? <= ? AND ?`;
        const sql = `${sqlKehadiran};${sqlKasbon};${sqlJoinBagian}`;
        const {result} = await query.query2(false,sql,arr);
        return result;
    }
    router.post('/search', async (req,res)=>{

        const gaji = await queryGaji(req.body.tgl);
        res.render('index',{data : gaji,tanggal : req.body.tgl, page : 'gaji/data',dataMenu:'penggajian'});
    })

    router.get('/', async (req,res)=>{
        let recentDate = moment().format('YYYY-MM-DD');
        
        const gaji = await queryGaji(recentDate);
        
        res.render('index',{data : gaji,tanggal : recentDate, page : 'gaji/data',dataMenu:'penggajian'});
    })

    router.post('/tambah', async (req,res)=>{
        
        const body = req.body;
        const sehari = 86400000;
        const gtTglParse = Date.parse(body.mulaiTglHit);
        const ltTglParse = Date.parse(body.akhirTglHit);
        const tanggal = body.tgl;
        const periode = ((ltTglParse - gtTglParse) / sehari)+1;
        const day = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

        const [keh,kas,bag] = await hitPeriode(req.body);
        
        if(keh.length<periode){
            const gaji2 = await queryGaji(tanggal);

            req.flash('error',`Jumlah data kehadiran dengan NIK (${body.nik}) tidak ada pada tanggal hitung yang anda masukkan!!, Lengkapi data kehadiran(link)`)

            return res.render('index',{data : gaji2,tanggal, page : 'gaji/data',dataMenu:'penggajian'});
        }

        body.upahPerHari = bag[0].upahPerHari;
        body.namaBagian = bag[0].namaBagian;
        body.jumHariMasuk = 0;
        body.jumJamLembur = 0;
        body.uangMakan = 0;
        body.bayar = 0;
        body.sisa = 0;
        body.idKasbon = null;

        //hitung masuk, lembur & uangMakan
        keh.forEach(e=>{
            //hari
            const hari = day[moment(e.tgl).day()];
            //masuk
            if(e.statusKeh==='Masuk') body.jumHariMasuk+=1;
            //lembur
            body.jumJamLembur += e.jamLembur;
            //uangMakan
            if(e.statusKeh == 'Masuk' && e.jamLembur>=4 && hari != 'Sabtu' && hari != 'Minggu'){
                body.uangMakan += bag[0].uangMakan;
            }
        })
        //hit gajiPokok
        body.gajiPokok = bag[0].upahPerHari * body.jumHariMasuk;
        //hitung insentif
        body.totInsentif = bag[0].insentif * body.jumHariMasuk;
        //hitung uangLembur
        body.uangLembur = Math.floor((bag[0].upahPerHari/7) * body.jumJamLembur);
        //hitung potkasbon
       if(kas.length>0){
            body.bayar =  kas[0].bayar?kas[0].bayar:0;
            body.sisa = kas[0].sisa;
            body.idKasbon = kas[0].idKasbon;
       }
        //hitung totGaji
        body.jumGaji = body.gajiPokok+body.totInsentif+body.uangMakan+body.uangLembur;
        
        res.render('index',{page:'gaji/tambah',data:body,dataMenu:'penggajian'});
    })

    router.post('/', async (req,res)=>{
        const body = req.body;
        const regex = /[^,\d]/g;

        body.uangLainlain =  body.uangLainlain==''?0:body.uangLainlain.replace(regex, '');
        body.potonganLainnya =  body.potonganLainnya==''?0:body.potonganLainnya.replace(regex, '');
        body.jumGaji = body.jumGaji.replace(regex, '');

        if(!body.cekBayar && body.cekBayar != "on"){
            body.potKasbon = 0
        }

        const sisa = body.sisa - body.potKasbon;
        const idKasbon = body.idKasbon;
        delete body.cekBayar;
        delete body.sisa;
        delete body.idKasbon;
        
        const {result:gaji} = await query.insert('gaji',body);

        if(gaji.affectedRows>0 && body.potKasbon>0){
            let statusKas = "Belum Lunas";
            const bayar = 0;

            if(sisa == 0){
                statusKas = "Lunas";
            }

            const objUpdate = {sisa,bayar,statusKas};
            const {result:kasbon} = await query.update(['kasbon',objUpdate,{idKasbon}]);
        }

        const gaji2 = await queryGaji(body.tgl);

        req.flash('success','Satu data berhasil di tambahkan');
        res.render('index',{data : gaji2, tanggal:body.tgl, page : 'gaji/data',dataMenu:'penggajian'});
    })

    router.post('/ubah', async (req,res)=>{
        
        const body = req.body;
        // console.log(body)
        // res.end()
        const sehari = 86400000;
        const gtTglParse = Date.parse(body.mulaiTglHit);
        const ltTglParse = Date.parse(body.akhirTglHit);
        const tanggal = body.tgl;
        const periode = ((ltTglParse - gtTglParse) / sehari)+1;
        const day = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

        const [keh,kas,bag] = await hitPeriode(req.body);
        
        if(keh.length<periode){
            const gaji2 = await queryGaji(tanggal);

            req.flash('error',`Jumlah data kehadiran dengan NIK (${body.nik}) tidak ada pada tanggal hitung yang anda masukkan!!, Lengkapi data kehadiran(link)`)

            return res.render('index',{data : gaji2,tanggal, page : 'gaji/data',dataMenu:'penggajian'});
        }

        body.upahPerHari = bag[0].upahPerHari;
        body.namaBagian = bag[0].namaBagian;
        body.jumHariMasuk = 0;
        body.jumJamLembur = 0;
        body.uangMakan = 0;
        body.bayar = 0;
        body.sisa = 0;
        body.idKasbon = null;

        //hitung masuk, lembur & uangMakan
        keh.forEach(e=>{
            //hari
            const hari = day[moment(e.tgl).day()];
            //masuk
            if(e.statusKeh==='Masuk') body.jumHariMasuk+=1;
            //lembur
            body.jumJamLembur += e.jamLembur;
            //uangMakan
            if(e.statusKeh == 'Masuk' && e.jamLembur>=4 && hari != 'Sabtu' && hari != 'Minggu'){
                body.uangMakan += bag[0].uangMakan;
            }
        })
        //hit gajiPokok
        body.gajiPokok = bag[0].upahPerHari * body.jumHariMasuk;
        //hitung insentif
        body.totInsentif = bag[0].insentif * body.jumHariMasuk;
        //hitung uangLembur
        body.uangLembur = Math.floor((bag[0].upahPerHari/7) * body.jumJamLembur);
        //hitung potkasbon
       if(kas.length>0){
            body.bayar =  kas[0].bayar?kas[0].bayar:0;
            body.sisa = kas[0].sisa;
            body.idKasbon = kas[0].idKasbon;
       }
        //hitung totGaji
        const uangLainlain = Number(body.uangLainlain);
        const potonganLainnya = Number(body.potonganLainnya);
        const potKasbon = Number(body.potKasbon);
        body.jumGaji = (body.gajiPokok+body.totInsentif+body.uangMakan+body.uangLembur)+uangLainlain-potonganLainnya-potKasbon;
        
        res.render('index',{page:'gaji/ubah',data:body,dataMenu:'penggajian'});

    })

    router.put('/', async (req,res)=>{

        const body = req.body;
        // console.log(body)
        // res.end()
        const regex = /[^,\d]/g;

        body.uangLainlain =  body.uangLainlain==''?0:body.uangLainlain.replace(regex, '');
        body.potonganLainnya =  body.potonganLainnya==''?0:body.potonganLainnya.replace(regex, '');
        body.jumGaji = body.jumGaji.replace(regex, '');

        const sisaKurang = Number(body.sisa) - Number(body.potKasbon);
        const sisaTambah = Number(body.sisa) + Number(body.potKasbon);
        const idKasbon = body.idKasbon;
        const potKasbon2 = body.potKasbon2;
        const cekBayar = body.cekBayar;

        if(!body.cekBayar && body.cekBayar != "on"){
            body.potKasbon = 0
        }
        
        delete body.cekBayar;
        delete body.sisa;
        delete body.idKasbon;
        delete body.potKasbon2;
        
        const {result:gaji} = await query.update(['gaji',body,{idGaji:body.idGaji}]);

        if(cekBayar == 'on' && potKasbon2>0 || !cekBayar && potKasbon2 ==0){
            // console.log('masuk')
            const gaji2 = await queryGaji(body.tgl);

            req.flash('success','Satu data berhasil di tambahkan');
            return res.render('index',{data : gaji2, tanggal:body.tgl, page : 'gaji/data',dataMenu:'penggajian'});
        }
        if(idKasbon > 0){
            // console.log('masuk2')
            if(cekBayar == 'on'){
                const statusKas = sisaKurang == 0 ? 'Lunas' : 'Belum Lunas';
                const sisa = sisaKurang;
                const bayar = 0;
                const {result:kasbon} = await query.update(['kasbon',{bayar,sisa,statusKas},{idKasbon}]);
            }
    
            if(!cekBayar && potKasbon2>0 ){
                const statusKas = 'Belum Lunas';
                const sisa = sisaTambah;
                const {result:kasbon} = await query.update(['kasbon',{sisa,statusKas},{idKasbon}]);
            }
        }else{
            // console.log('masuk3')
            if(!cekBayar && potKasbon2 > 0){
            // console.log('masuk4')
                const nik  = body.nik;
                const tgl = moment().format('YYYY-MM-DD');
                const jumlah = potKasbon2;
                const sisa = potKasbon2;
                const statusKas = 'Belum Lunas'
                const {result:kasbon} = await query.insert('kasbon',{nik,tgl,jumlah,sisa,statusKas});
            }
        }

        const gaji2 = await queryGaji(body.tgl);

        req.flash('success','Satu data berhasil di tambahkan');
        res.render('index',{data : gaji2, tanggal:body.tgl, page : 'gaji/data',dataMenu:'penggajian'});
    })

    // gaji.delete('/',(req,res)=>{
    //     if(!req.session.login){
    //         req.flash('error','Anda harus Login terlebih dahulu')
    //         throw res.redirect('/auth/login')
    //     }
        
    //     Gaji.deleteOne({_id : req.body.id},(err,data)=>{
    //         if(err) return res.send(err);
    //         req.flash('success',`Satu Data berhasil dihapus`);
    //         res.redirect('/gaji/data');
    //     })
    // })

    // gaji.get('/laporan',(req,res)=>{
    //     if(!req.session.login){
    //         req.flash('error','Anda harus Login terlebih dahulu')
    //         throw res.redirect('/auth/login')
    //     }
        
    //     let recentDate = new Date()
    //     let tanggal = new Date(recentDate.getFullYear(),recentDate.getMonth(),recentDate.getDate());
    //     // let find = { "$expr": { "$gt": [ { "$size": {  "$regexFindAll": { "input": {"$toString": "$tanggal"}, "regex": tanggal.toJSON().slice(0,10) } }},0]} };

    //     Gaji.find({tglPenggajian : Date.parse(tanggal)}).populate({ path : 'idPegawai', populate : 'idBagian'}).exec((err,dataGaji)=>{
    //         if(err) return res.send(err)
    //         res.render('index',{dataG : dataGaji, tanggal : tanggal, page : 'gaji/laporan'});
    //     })
    // })

    // gaji.post('/laporan_search',(req,res)=>{
    //     if(!req.session.login){
    //         req.flash('error','Anda harus Login terlebih dahulu')
    //         throw res.redirect('/auth/login')
    //     }
        
    //     const inputSearch = req.body.inputSearch.split('-');
    //     const tanggal = new Date(inputSearch[0],inputSearch[1]-1,inputSearch[2]);
    //     // let find = { "$expr": { "$gt": [ { "$size": {  "$regexFindAll": { "input": {"$toString": "$tanggal"}, "regex": tanggal.toJSON().slice(0,10) } }},0]} };

    //     Gaji.find({tglPenggajian : Date.parse(tanggal)}).populate({ path : 'idPegawai', populate : 'idBagian'}).exec((err,dataGaji)=>{
    //         if(err) return res.send(err)
    //         res.render('index',{dataG : dataGaji, tanggal : tanggal, page : 'gaji/laporan'});
    //     })
    // })
    router.post('/slip', async (req,res)=>{

        const
        
        gaji = ['gaji','karyawan','nik','gaji','nik','idGaji',req.body.idGaji],
        bagian = ['bagian','karyawan','idBagian','bagian','idBagian'],
        arr = ['karyawan',...bagian,...gaji],
        sql = `SELECT * FROM ((?? INNER JOIN ?? ON ??.?? = ??.??)INNER JOIN ?? ON ??.?? = ??.??) WHERE ?? = ?`,
        {result} = await query.query2(true,sql,arr),
        [keh,kas,bag] = result,
        slipEjs = path.join(__dirname,'../views/gaji/slip.ejs');

        res.render(slipEjs,{data : result,dataMenu:'penggajian'},(err,html)=>{
            if(err) throw err
            const img = path.join(__dirname,'../public/dist/img/').replace(/\\/g,'/');
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

        // Gaji.findById(req.body.idGaji).populate({ path : 'idPegawai', populate : 'idBagian'}).exec((err,dataGaji)=>{
        //     if(err) return res.send(err);
        //     Kasbon.findOne({idPegawai : req.body.idPegawai, status : 'Belum Lunas'},(err,dataKasbon)=>{
        //         const img = path.join(__dirname,'../public/dist/img/').replace(/\\/g,'/');
        //         if(dataGaji.status == 'Belum Diterima'){
        //             dataGaji.status = 'Diterima';
        //             dataGaji.save(err=>{
        //                 if(err) return res.send(err)
        //                 if(dataKasbon){
        //                     if(dataKasbon.bayar > 0){
        //                         dataKasbon.sisaKasbon = dataKasbon.sisaKasbon - dataKasbon.bayar;
        //                         dataKasbon.bayar = 0;
        //                         if(dataKasbon.sisaKasbon == 0) dataKasbon.status = 'Lunas';
        //                         dataKasbon.save(err=>{
        //                             if(err) return res.send(err);
        //                         })
        //                     }
        //                 }
    
        //             })
        //         }

        //         res.render(path.join(__dirname,'../views/gaji/cetak_slip.ejs'),{data : dataGaji},(err,html)=>{
        //             console.log(img)
        //             const option = {
        //                 format : 'Letter',
        //                 base : 'file:///'+img
        //             }
        //             pdf.create(html,option).toFile('./views/gaji/slip.pdf',(err,path)=>{
        //                 const option = {headers : {'Content-Type': 'application/pdf'}}
        //                 // res.attachment('slip')
        //                 res.sendFile(path.filename,option);
        //             })
        //         })

        //     })

        // })
    })

    // gaji.get('/cetak_laporan/:tgl',(req,res)=>{
    //     if(!req.session.login){
    //         req.flash('error','Anda harus Login terlebih dahulu')
    //         throw res.redirect('/auth/login')
    //     }
        
    //     Gaji.find({tglPenggajian : req.params.tgl}).populate({path : 'idPegawai', populate : 'idBagian'}).exec((err,dataGaji)=>{
    //         ejs.renderFile(path.join(__dirname,'../views/gaji/cetak_laporan.ejs'),{dataG : dataGaji, tglPenggajian : Number(req.params.tgl)},(err,html)=>{
    //             const option = {
    //                 format : 'Letter',
    //                 orientation: "landscape"
    //             }
    //             pdf.create(html,option).toFile('./views/gaji/laporan_gaji.pdf',(err,path)=>{
    //                 const option = {headers : {'Content-Type': 'application/pdf'}}
    //                 // res.attachment('slip')
    //                 res.sendFile(path.filename,option);
    //             })
    //         })

    //     })
    // })


    return router;

}