const mongoose = require('mongoose')


let perusahaanSchema,
adminSchema,
pegawaiSchema,
kehadiranSchema,
lemburSchema,
kasbonSchema,
bagianSchema,
gajiSchema


perusahaanSchema = new mongoose.Schema({
    nama : String,
    alamat : String,
    kodePos : String,
    noTepl : String,
    email : String
})
adminSchema = new mongoose.Schema({
    username : String,
    password : String
})
pegawaiSchema = new mongoose.Schema({
    nip : {type : Number, indexes : true, required : true},
    nama : String,
    jenKelamin : {type : String, enum : ["Laki-laki","Perempuan"]},
    alamat : String,
    tempat : String,
    tglLahir : {type : Number, default : 0},
    foto : String,
    idBagian : {type : mongoose.Schema.Types.ObjectId, ref : 'Bagian'},
    gajiPokok : {type : Number, default : 0},
    insentif : {type : Number, default : 0},
    noTelp : {type : String, default : '-'},
    tglMasuk : {type : Number, default : 0},
})

absensiSchema = new mongoose.Schema({
    idPegawai : {type : mongoose.Schema.Types.ObjectId, ref : 'Pegawai'},
    tanggal : {type : Number, required : true},
    sift : {type : String, enum : ['1','2','3']},
    status : {type : String, enum : ['masuk','sakit','izin','alpha']},
    jamMasuk : {type : String},
    jamPulang : {type : String},
    ket : {type : String}

})

lemburSchema = new mongoose.Schema({
    idPegawai : {type : mongoose.Schema.Types.ObjectId, ref : 'Pegawai'},
    tanggal : {type : Number, required : true},
    jamMasuk : {type : Number, required : true},
    jamPulang : {type : Number, required : true},
    ket : {type : String}

})

gajiSchema = new mongoose.Schema({
    idPegawai : {type : mongoose.Schema.Types.ObjectId, ref : 'Pegawai'},
    tglPenggajian : {type : Number, required : true},
    mulaiTglHit : {type : Number, required : true},
    akhirTglHit : {type : Number, required : true},
    jumHariMasuk : {type : Number, default : 0},
    jumJamLembur : {type : Number, default : 0},
    uangTambahan : {type : Number, default : 0},
    ket : {type : String,  default : "-"},
    status : {type : String, enum : ['Diterima','Belum Diterima'], default : 'Belum Diterima'},
    potKasbon : {type : Number,  default : 0},
    uangLembur :{type : Number, default : 0},
    totGaji : {type : Number, default : 0},
    gajiDiTerimah : {type : Number, default : 0},
    

})


kasbonSchema = new mongoose.Schema({
    idPegawai : {type : mongoose.Schema.Types.ObjectId, ref : 'Pegawai'},
    jmlKasbon : {type : Number, required : true},
    sisaKasbon : {type : Number, default : 0},
    status : {type : String, enum : ['Lunas','Belum Lunas'], default: 'Belum Lunas'},
    bayar : {type : Number, default : 0},
    tglKasbon : {type : Number, required : true}
})
bagianSchema = new mongoose.Schema({
    namaJenis : String
})




module.exports = {
    perusahaan : mongoose.model('Perusahaan',perusahaanSchema),
    admin : mongoose.model('Admin',adminSchema),
    bagian : mongoose.model('Bagian',bagianSchema),
    pegawai : mongoose.model('Pegawai',pegawaiSchema),
    kasbon : mongoose.model('Kasbon',kasbonSchema),
    gaji : mongoose.model('GajiPegawai',gajiSchema),
    absensi : mongoose.model('Absensi',absensiSchema),
    lembur : mongoose.model('Lembur',lemburSchema),

    
}











