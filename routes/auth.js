const Admin = require('../model/m_penggajian').admin

module.exports = function(app,auth){
    auth.get('/login',(req,res)=>{
        if(req.cookies.login){
            if(req.cookies.login === 'true'){
                req.session.login = true
            }
        }
        if(req.session.login){
            return res.redirect('/')
        }
        
        res.render('auth')
    })

    auth.post('/login',(req,res)=>{
        Admin.findOne({username : req.body.username},(err,data)=>{
            if(err) res.send(err)
            if(data){

                if(data.password == req.body.password){
                    if(req.body.remember){
                        res.cookie('login','true',{ maxAge : 30000 })
                    }
                    //setting session
                    req.session.login = true
                    return res.redirect('/')
                }
            }

            req.flash('error','Username/Password yang anda Masukan Salah')
            res.redirect('/auth/login')
        })
    })

    auth.get('/logout',(req,res)=>{
        req.session.destroy(err=>{
            res.clearCookie('login')
            res.redirect('/auth/login')
        })
    })

    app.use('/auth',auth)
}