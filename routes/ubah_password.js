const bcrypt = require('bcrypt');
const query = require('../config/query');
module.exports = function(router){
    router.get('/',(req,res)=>{
        res.render('index',{page:'ubah_password',dataMenu:'ubahPassword'})
    })
    router.put('/', async (req,res)=>{
        
        const username = req.session.login;
        const pwdLama = req.body.pwdLama;
        const pwdBaru = req.body.pwdBaru;
        const saltRound = 10;

        const sql = "SELECT * FROM ?? WHERE ?";
        const arrSql = ['user',{username}];
        const {result:user} = await query.query2(false,sql,arrSql);
        const bool = await bcrypt.compare(pwdLama, user[0].password);
        if(bool){

            const hash = await bcrypt.hash(pwdBaru,saltRound)
            const sql = "UPDATE ?? SET ? WHERE ?";
            const arrSql = ['user',{password:hash},{idUser:user[0].idUser}];
            const {result:update} = await query.query2(false,sql,arrSql);
            
            req.flash('success','Password berhasil diubah')
            return res.redirect('/ubah-password');
        }
        req.flash('error','Password lama salah')
        res.redirect('/ubah-password');
    })
    return router
}