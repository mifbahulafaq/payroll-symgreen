
module.exports = function(router){
    router.get('/',(req,res,next)=>{
        res.render('index',{page : 'dashboard',dataMenu:'dashboard'});
    })

    return router;

}