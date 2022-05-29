module.exports = {
    moment : require('moment'),
    hakAkses : {
        Administrasi : ['dash','kar','kas','gaji','ubhPass','logout'],
        Supervisor : ['dash','keh','ubhPass','logout'],
        HRD :['dash','kar','keh','kas','gaji','ubhPass','logout']
    },
    currency : function (nilai){
        const sisa = nilai.toString().length % 3
        let rupiah = nilai.toString().substr(0,sisa)
        let ribu = nilai.toString().substr(sisa).match(/\d{3}/gi)//the method match() retrieves the result ofmatching a string against a regex, and become a array
        separator = sisa && nilai.toString().length > 3?'.':'';
          
        if(ribu){
          rupiah+=separator+ribu.join('.')
        }
        return rupiah;
      
  
    }
}