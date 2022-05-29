const conn = require('./database');

function select(arr){
    return new Promise((res,rej)=>{

        const objOfArr = arr.filter(e=>typeof(e) == 'object' && e instanceof Array == false);
        const arrOfArr = arr.filter(e=> e instanceof Array);
        const strOfArr = arr.filter(e=> typeof e == 'string');

        let sql = '';
        strOfArr.forEach((e,i)=>{
            const slc = arrOfArr[i]?'??':'*';
            const wr = objOfArr[i]?`WHERE ?`:'';
            // const frm = strOfArr[i];
            sql+=`${i>0?';':''} SELECT ${slc} FROM ?? ${wr}`;
        })
        // console.log(arr)
        // console.log(sql)
        conn.query(sql,arr,(err,result,field)=>{
            if(err) throw err;
            res({result,field});
        });
    })
}

function insert(table,obj){
    return new Promise((res,rej)=>{
        let input = [];
        let val;

        for(prop in obj){
            const val = obj[prop] instanceof Array?obj[prop]:[obj[prop]];
            val.forEach((e,i)=>{
                if(!input[i])input[i] = [];
                input[i].push(e);
            })
        }
        input.forEach(()=>{
            if(!val){
                val='(?)'
            }else{
                val+=',(?)';
            }
        });

        const col = Object.keys(obj);
        const arr = [table,col,...input];
        const sql = `INSERT INTO ?? (??) VALUES ${val}`;
        conn.query(sql,arr,(err,result,field)=>{
            if(err) throw err;
            res({result,field});
        });
        // console.log(sql)
        // res({result:''});
    })
}

function update(arr){
    return new Promise((res,rej)=>{
        const sql = `UPDATE ?? SET ? WHERE ?`;
        conn.query(sql,arr,(err,result,field)=>{
            if(err) throw err;
            res({result,field});
        });
    })
}

function delete1(arr){
    return new Promise((res,rej)=>{
        const sql = `DELETE FROM ?? WHERE ?`;
        conn.query(sql,arr,(err,result,field)=>{
            if(err) throw err;
            res({result,field});
        });
    })
}
function slcJn(obj){
    return new Promise((res,rej)=>{
        const {slc,frm,jn,fkFrm,pkJn} = obj;
        const sql = `SELECT ${slc} FROM ${frm} INNER JOIN ${jn} ON ${frm}.${fkFrm} = ${jn}.${pkJn}`;
        conn.query({sql,nestTables:true},(err,result,field)=>{
            if(err) throw err;
            res({result,field});
        });
    })
}

function query2(bool,sql,arr){
    return new Promise((res,rej)=>{
        if(bool){
            conn.query({sql,nestTables:true},arr,(err,result,field)=>{
                if(err) throw err;
                res({result,field});
            });
        }else{
            conn.query(sql,arr,(err,result,field)=>{
                if(err) throw err;
                res({result,field});
            });

        }
    })
}

function coba(sql){
    return new Promise((res,rej)=>{
        conn.query({sql,nestTables:true},(err,result,field)=>{
            if(err) throw err;
            res({result,field});
        });
    })
}

module.exports = {
    select,
    slcJn,
    delete1,
    insert,
    update,
    query2,
    coba
}