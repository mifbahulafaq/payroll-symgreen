let Bagian = require('../model/m_penggajian').bagian;


module.exports = function(app,bagian){
    bagian.get('/tambah',(req,res)=>{
        if(!req.session.login){
            req.flash('error','Anda harus Login terlebih dahulu')
            throw res.redirect('/auth/login')
        }
        
        const bagian = new Bagian({
            namaJenis : 'Sortir'
        });
        app.save((err,bagian)=>{
            if(err) res.send(err);
            res.json(bagian);
        });
        res.send('sdsd');
    });

    app.use('/bagian',bagian);

}
    
