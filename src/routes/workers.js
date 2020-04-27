
const express = require('express');


const router = express.Router();


const pool = require('../database');


const { isLoggedIn } = require('../lib/auth');


router.get('/add', isLoggedIn, (req,res) => {
    
    
    return res.render('workers/add');
});

router.post('/add', isLoggedIn, async (req,res) => {
    
    const { worker_rut, worker_name, worker_surname, worker_address, worker_contract_date, worker_hours_day, worker_hours_month, worker_hours_week, worker_state } = req.body;

    const new_worker = {
        worker_rut,
        worker_name,
        worker_surname,
        worker_address,
        worker_contract_date,
        worker_hours_day,
        worker_hours_month,
        worker_hours_week,
        worker_state,
        user_id: req.user.id
    };

    
    const if_exist_worker = await pool.query('SELECT * FROM trabajador WHERE worker_rut = ? AND user_id = ?',[worker_rut,req.user.id]);

    
    if(if_exist_worker.length > 0)
    {
        
        req.flash('message','The Worker Already Exists'); 
        res.redirect('/workers');
    }
    else
    {
        
        await pool.query('INSERT INTO trabajador set ?',[new_worker]);
        req.flash('success','Worker Saved Successfully');
        
        res.redirect('/workers');
    }
});

router.get('/', isLoggedIn, async (req,res) => {
    
    const workers = await pool.query('SELECT * FROM trabajador WHERE user_id = ?',[req.user.id]);
    const workered_hours = await pool.query('SELECT rut_trabajador, SUM(horas_trabajadas) AS suma_horas FROM trabajador_sector WHERE user_id = ? group by rut_trabajador order by suma_horas DESC',[req.user.id]);
    console.log(workered_hours);
  
    return res.render('workers/list',{workers, workered_hours});
});


router.get('/delete/:worker_rut', isLoggedIn, async (req,res) => {
   
    const { worker_rut } = req.params;

    
    const rut = await pool.query('SELECT worker_rut FROM trabajador WHERE worker_rut = ?',[worker_rut]);
    

    if(rut.length > 0) 
    {    

        const rut_trabajador = worker_rut;
        await pool.query('DELETE FROM trabajador WHERE worker_rut = ?',[worker_rut]);
        await pool.query('DELETE FROM trabajador_sector WHERE rut_trabajador = ?',[rut_trabajador]);
        //redirect a other link
        req.flash('success','Worker Deleted Successfully');
        res.redirect('/workers');
    }
    else
    {
        const value_error = 'worker_val_not_found';
        const type_err = 'ERROR 404';
        const content_error = 'verify the rut from the url, the rut doesn´t exist';
        res.status(404).render('errors/error',{value_error,type_err,content_error});
    }
});


router.get('/edit/:worker_rut', isLoggedIn, async (req,res) => {
  
    const {worker_rut} = req.params;

 
    const rut = await pool.query('SELECT worker_rut FROM trabajador WHERE worker_rut = ?',[worker_rut]);
    
    if(rut.length > 0) 
    {    
   
        const worker = await pool.query('SELECT * FROM trabajador WHERE worker_rut = ?',[worker_rut]);
        
        res.render('workers/edit',{worker: worker[0]});
    }
    else
    {
        const value_error = 'worker_val_not_found';
        const type_err = 'ERROR 404';
        res.status(404).render('errors/error',{value_error,type_err});
        const content_error = 'verify the rut from the url, the rut doesn´t exist';
        res.status(404).render('errors/error',{value_error,type_err,content_error});
    }
});


router.post('/edit/:worker_rut', isLoggedIn, async (req,res) => {
    
    const {worker_rut} = req.params;
    
    const {worker_name, worker_surname, worker_address, worker_contract_date, worker_hours_day, worker_hours_month, worker_hours_week, worker_state } = req.body;
    
    const new_worker = {
        worker_rut,
        worker_name,
        worker_surname,
        worker_address,
        worker_contract_date,
        worker_hours_day,
        worker_hours_month,
        worker_hours_week,
        worker_state
    };

    const names_update = {
        nombre: worker_name,
        apellido: worker_surname
    };
    let rut_trabajador = worker_rut;

 
    await pool.query('UPDATE trabajador SET ? WHERE worker_rut = ?',[new_worker,worker_rut]);
    await pool.query('UPDATE trabajador_sector SET ? WHERE rut_trabajador = ?',[names_update,rut_trabajador]);
    

    req.flash('success','Worker Edited Successfully');
    res.redirect('/workers');
});


router.get('*',(req,res) => {
    const value_error = 'URL_not_found';
    const type_err = 'ERROR 404';
    const fullUrl = (req.protocol + '://' + req.get('host') + req.originalUrl);
    const content_error = 'Verify the url '+fullUrl;
    res.status(404).render('errors/error',{value_error,type_err,content_error});
});


module.exports = router;