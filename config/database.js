const mysql=require('mysql');
const connection=mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'',
  database:'penggajiansym',
  dateStrings:true,
  multipleStatements:true
});
connection.connect(function(error){
  if(!!error) throw error;
    console.log('Connected!')
});  
module.exports = connection; 