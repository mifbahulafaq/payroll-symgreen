//===module
const express = require('express')
const app = express()
const flash = require('express-flash')
const logger = require('morgan')
const path = require('path')
const mongoose = require('mongoose')
const dbUrl = require('./config/config').database.url
const port = require('./config/config').server.port
const expressValidator = require('express-validator') //Express Validator Middleware for Form Validation
const bodyParser = require('body-parser')
const methodOverride = require('method-override') //this module lets you use http verbs such as put and delete where the client doesn't support it, This defaults to only POST methods, which is the only method the override should arrive in.
const session = require('express-session')
const cookieParser = require('cookie-parser')
const fs = require('fs');





//===db Connection===
mongoose.connect(dbUrl,{useNewUrlParser:true,useUnifiedTopology:true})
mongoose.connection.on('error',console.error.bind(console,'connection error'))
.once('open',()=>console.log('db connection success'))


app.set('view engine', 'ejs')

//use static files
app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname,'uploads/images')));

app.use(logger('dev'))
app.use(bodyParser.urlencoded({extended : true}))
app.use(bodyParser.json())

app.use(cookieParser('aaa'))
app.use(session({
    secret : '32',
    resave : true,
    saveUninitialized : true,
    cookie : {
    }
}))

app.use(flash())
app.use(methodOverride((req,res)=>{
    if(req.body && typeof req.body === 'object' &&  '_method' in req.body){
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body.method
        return method
    }
}));

app.use(function(req,res,next){
    console.log('time : ', Date.now());
    // res.end()
    next();
})

require('./routes/lembur')(app,express());
require('./routes/auth')(app,express());
require('./routes/dashboard')(app,express());
require('./routes/pegawai')(app,express());
require('./routes/bagian')(app,express());
require('./routes/kasbon')(app,express());
require('./routes/gaji')(app,express());
require('./routes/absensi')(app,express());


app.get('/',(req,res,next)=>{
console.log(req.session)
    res.end()
})




// require('./routes/index')(express)

// app.use(expressValidator()) //Express Validator Middleware for Form Validation


app.listen(port)
console.log('server is running'+port)
