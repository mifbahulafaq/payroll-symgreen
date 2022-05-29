const query = require('../config/query');
const moment = require('moment');
const { end } = require('../config/database');

module.exports = function(router){

    router.post('/search', async (req,res)=>{
        // const inputSearch = req.body.inputSearch.split('-');
        // const tanggal = new Date(inputSearch[0],inputSearch[1]-1,inputSearch[2]);
        // // let find = { "$expr": { "$gt": [ { "$size": {  "$regexFindAll": { "input": {"$toString": "$tanggal"}, "regex": req.body.inputSearch } }},0]} };
        // Absensi.find({tanggal : Date.parse(tanggal)}).populate('idPegawai').exec((err,dataAbsensi)=>{
        //     if(err) return res.send(err)
        //         Pegawai.find().select('nama').select('_id').select('nip').exec((err,dataPegawai)=>{
        //             if(err) return res.send(err);
        //             return res.render('index',{dataA : dataAbsensi, dataP : dataPegawai, tanggal : tanggal, page : 'absensi/data'});
        //         })
        //     // res.render('index',{data : dataAbsensi, page : 'absensi/ubah'});
            
        // })
        const tgl = req.body.tgl;
        const {result} = await query.select(['kehadiran',{tgl},'karyawan']);
        const obj = {
            dataKeh : result[0],
            dataKar : result[1],
            page : 'kehadiran/data',
            tgl,
            dataMenu:'dataKehadiran',
            dataDropDown:'kehadiran'
        }
        res.render('index',obj);
    })

    router.get('/', async (req,res)=>{
        
        // let recentDate = new Date()
        // let tanggal = new Date(recentDate.getFullYear(),recentDate.getMonth(),recentDate.getDate());
        // let find = { "$expr": { "$gt": [ { "$size": {  "$regexFindAll": { "input": {"$toString": "$tanggal"}, "regex": tanggal.toJSON().slice(0,10) } }},0]} };

        // Absensi.find({tanggal : Date.parse(tanggal)}).populate('idPegawai').exec((err,dataAbsensi)=>{

        //     Pegawai.find({},(err,dataPegawai)=>{
        //         return res.render('index',{dataA : dataAbsensi, dataP : dataPegawai, tanggal : tanggal, page : 'absensi/data'});
        //     })
        // })
        
        const tgl = moment().format('YYYY-MM-DD');
        const {result} = await query.select(['kehadiran',{tgl},'karyawan']);
        const obj = {
            dataKeh : result[0],
            dataKar : result[1],
            page : 'kehadiran/data',
            tgl,
            dataMenu:'dataKehadiran',
            dataDropDown:'kehadiran'
        }
        console.log(moment(tgl))
        res.render('index',obj);
    })

    router.post('/', async (req,res)=>{

        const tgl = req.body.tglKehadiran;
        delete req.body.tglKehadiran;
        req.body.statusKeh = [];

        for(prop in req.body){
            const bool = req.body[prop]instanceof Array;
            if(prop.includes('status') && !bool){
                req.body.statusKeh.push(req.body[prop]);
                delete req.body[prop];
            }
        }
        
        const {result} = await query.insert('kehadiran',req.body);
        const {result : result2} = await query.select(['kehadiran',{tgl},'karyawan']);
        const obj = {
            dataKeh : result2[0],
            dataKar : result2[1],
            page : 'kehadiran/data',
            tgl,
            dataMenu:'dataKehadiran',
            dataDropDown:'kehadiran'
        }
        res.render('index',obj);
    })

    router.put('/', async (req,res)=>{
        const idKehadiran = req.body.idKehadiran;
        const {result} = await query.update(['kehadiran',req.body,{idKehadiran}]);
        
        const tgl = req.body.tgl;

        const {result : result2} = await query.select(['kehadiran',{tgl},'karyawan']);
        const obj = {
            dataKeh : result2[0],
            dataKar : result2[1],
            page : 'kehadiran/data',
            tgl,
            dataMenu:'dataKehadiran',
            dataDropDown:'kehadiran'
        }
        req.flash('success','satu data berhasil di ubah');
        res.render('index',obj);
    })

    router.get('/delete', async (req,res)=>{
        
        const idKehadiran = req.query.id;
        const tgl = req.query.date;

        const {result} = await query.delete1(['kehadiran',{idKehadiran}]); 
        const {result : result2} = await query.select(['kehadiran',{tgl},'karyawan']);

        const obj = {
            dataKeh : result2[0],
            dataKar : result2[1],
            page : 'kehadiran/data',
            tgl,
            dataMenu:'dataKehadiran',
            dataDropDown:'kehadiran'
        }
        req.flash('success','satu data berhasil dihapus');
        res.render('index',obj);
    })

    router.get('/rekap', async (req,res,next)=>{
        res.render('index',{page:'kehadiran/rekap',
        data:[],
        gt:'',
        lt:'',
        dataMenu:'rekapKehadiran',
        dataDropDown:'kehadiran'})
    })

    router.post('/rekap', async (req,res)=>{
        const gt = req.body.gt;
        const lt = req.body.lt;
        const arr = ['kehadiran',gt,lt,['nik','nama'],'karyawan'];
        const sql = "SELECT * FROM ?? WHERE tgl >= ? AND tgl <= ? ; SELECT ?? FROM ??";
        const {result} = await query.query2(false,sql,arr);
        console.log(result)
        res.render('index',{page:'kehadiran/rekap',
        data:result,
        gt,
        lt,
        dataMenu:'rekapKehadiran',
        dataDropDown:'kehadiran'})
    })

    return router;

}