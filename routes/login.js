const bcrypt = require('bcrypt');
const query = require('../config/query');
const {randomBytes} = require('crypto');

module.exports = function(router){

    router.get('/', async (req,res)=>{
        if(req.cookies.u_HA){
            const username = req.cookies.u_HA;
            const {result} = await query.select(['user',{username}])
            if(result.length>0){
                req.session.login = result[0].username;
            }
        }
        if(req.session.login) {
            return res.redirect('/dashboard');
        }

        res.render('login');
    })

    router.post('/', async (req,res)=>{

        const username = req.body.username;
        const password1 = req.body.password;
        const {result} = await query.select(['user',{username}]);
		
        if(result.length>0){
            const bool = await bcrypt.compare(password1, result[0].password);
            //async is recommended, if yu are using bcrypt on server. read the documentation..
            if(bool){
                if(req.body.remember){
                    const buf = randomBytes(30);
                    const randomData = buf.toString('hex');
                    const randomData2 = randomData.slice(0, randomData.length-1)
                    const rememberMe = randomData2 + result[0].idUser;

                    await query.update(['user',{rememberMe},{username}])

                    res.cookie('u_HA',rememberMe,{
                        maxAge:60000,
                        httpOnly:true
                    })
                }

                req.session.login = result[0].username;
                return res.redirect('/dashboard');
            }
        }
        req.flash('error','Username/Password yang anda Masukan Salah')
        return res.redirect('/');
    })

    router.get('/logout',(req,res)=>{
        req.session.destroy(err=>{
            if(err) throw err;
            res.clearCookie('u_HA')
            res.redirect('/')
        })
    })
    return router;

}