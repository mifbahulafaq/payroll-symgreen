//===module
const express = require('express');
const app = express()
const flash = require('express-flash')
const logger = require('morgan')
const path = require('path')
const port = require('./config/server').port;
const expressValidator = require('express-validator') //Express Validator Middleware for Form Validation
const methodOverride = require('method-override') //this module lets you use http verbs such as put and delete where the client doesn't support it, This defaults to only POST methods, which is the only method the override should arrive in.
const session = require('express-session')
const cookieParser = require('cookie-parser')
const fs = require('fs');
const multer = require('multer');
const upload = require('./config/upload');
const query = require('./config/query');
const locals = require('./locals/locals');
const bcrypt = require('bcrypt')

// async function changePwd(){
	// const result =  await bcrypt.hash('hrd',10)
	// console.log(result)
// }
// changePwd()

//local variables
app.locals = locals;

app.set('view engine', 'ejs')

//use static files
app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname,'uploads/images')));
app.use(logger('dev'));
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(cookieParser("secret"));
app.use(session({
    secret : 'string',
    resave : false,
    saveUninitialized : false
}));
app.use(flash());
app.use(async (req,res,next)=>{
    if(req.path != '/'){
        if(req.cookies.u_HA){
            const length = req.cookies.u_HA.length - 1;
            const idUser = req.cookies.u_HA.charAt(length);
            const {result} = await query.select(['user',{idUser}])

            if(result.length>0){
                req.session.login = result[0].username
            }
        }
        if(req.session.login) {
            const username = req.session.login;
            const {result} = await query.select(['user',{username}]);
            res.locals.login = result[0].hakAkses;

            const contType = req.headers['content-type'];
            const upImg = contType?contType.includes('multipart/form-data'):'';
            
            if(upImg){
                return upload(req,res, function(err){
                    console.log(req.body)
                    if(err instanceof multer.MulterError){
                        req.multerErr = err;
                    }else if(err){
                        req.unknownErr = err;
                    }
                    return next();
                });
            }else{
                return next();
            }
        }
        return res.redirect('/')

    }

    next()
})
app.use(methodOverride((req,res)=>{
    if(req.body && typeof req.body === 'object' &&  '_method' in req.body){
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}));


const auth = require('./routes/login')(express.Router());
const karyawan = require('./routes/karyawan')(express.Router());
const bagian = require('./routes/bagian')(express.Router());
const kasbon = require('./routes/kasbon')(express.Router());
const kehadiran = require('./routes/kehadiran')(express.Router());
const gaji = require('./routes/gaji')(express.Router());
const dashboard = require('./routes/dashboard')(express.Router());
const ubahPassword = require('./routes/ubah_password')(express.Router());

app.use('/',auth);
app.use('/karyawan',karyawan);
app.use('/bagian',bagian);
app.use('/kasbon',kasbon);
app.use('/kehadiran',kehadiran);
app.use('/gaji',gaji);
app.use('/dashboard',dashboard);
app.use('/ubah-password',ubahPassword);

// app.get('/coba',(req,res,next)=>{
//     req.session.login = true
//     res.cookie('coba','coba',{
//         maxAge:60000,
//         httpOnly:true
//     })
//     res.end()
// })
// app.get('/coba2',(req,res,next)=>{
// console.log(req.session)
// console.log(req.cookies.coba)
//     res.end()
// })
// app.get('/coba3',(req,res,next)=>{
//     console.log(req.session)
//         res.end()
// })




// require('./routes/index')(express)

// app.use(expressValidator()) //Express Validator Middleware for Form Validation


app.listen(port)
console.log('server is running'+port)
