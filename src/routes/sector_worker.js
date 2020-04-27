//in this lines are defined the objects to muse in this route, and a element named route is defined to navigate routes
const express = require('express');
const router = express.Router();

const pool = require('../database');

const { isLoggedIn } = require('../lib/auth');

//This is the case are yoy stay in localhost:4000/sector_worker/add
router.get('/add', isLoggedIn, async (req,res) => {
    const sector = await pool.query('SELECT * FROM sector WHERE user_id = ?',[req.user.id]);
    console.log(sector);
    const worker = await pool.query('SELECT * FROM trabajador WHERE user_id = ?',[req.user.id]);
    //console.log(worker);
    const section = await pool.query('SELECT * FROM seccion WHERE user_id = ?',[req.user.id]);
    //console.log(section);
    res.render('sector_worker/add',{sector, worker, section});
});

router.get('/', isLoggedIn, async (req,res) => {
    const workeds =  await pool.query('SELECT * FROM trabajador_sector WHERE user_id = ?',[req.user.id]);
    console.log(workeds);
    let totalesHoras = await pool.query('SELECT SUM(horas_trabajadas) AS suma_horas FROM trabajador_sector WHERE user_id = ?',[req.user.id]);
    res.render('sector_worker/list',{workeds, totalesHoras});
});


router.get('/edit/:id', isLoggedIn, async (req,res) => {
    const {id} = req.params;
    console.log(id);

    const if_exist = await pool.query('SELECT * FROM trabajador_sector WHERE id = ? AND user_id = ?',[id,req.user.id]);
    if(if_exist.length>0)
    {
        const workered = await pool.query('SELECT * FROM trabajador_sector WHERE id = ? AND user_id = ?',[id, req.user.id]);
        console.log(workered[0]);
        const sector = await pool.query('SELECT sector_name FROM sector WHERE user_id = ?',[req.user.id]);
        const worker = await pool.query('SELECT * FROM trabajador WHERE user_id = ?',[req.user.id]);
        const section = await pool.query('SELECT descripcion FROM seccion WHERE user_id = ?',[req.user.id]);
        res.render('sector_worker/edit',{workered: workered[0], worker, sector, section});
    }
    else
    {
        const value_error = 'workered_not_found';
        const type_err = 'ERROR 404';
        const content_error = 'verify the id from the url, the id doesn´t exist';
        res.status(404).render('errors/error',{value_error,type_err,content_error});
    }
});

router.post('/edit/:id', isLoggedIn, async (req,res) => {
    const {id} = req.params;

    const if_exist = await pool.query('SELECT * FROM trabajador_sector WHERE id = ? AND user_id = ?',[id,req.user.id]);
    if(if_exist.length>0)
    {

    const {rut_trabajador,sector_trabajo,seccion, dia, mes, ano, fecha_trabajada, horas_trabajadas} = req.body;
    console.log(rut_trabajador);
    console.log(sector_trabajo);
    console.log(seccion);
    console.log(dia);
    console.log(mes);
    console.log(ano);
    console.log(fecha_trabajada);
    console.log(horas_trabajadas);

    const seccion_id = await pool.query('SELECT id FROM seccion WHERE descripcion = ? AND user_id = ?',[seccion,req.user.id]);
    const seccion_ligada = seccion_id[0].id;

    const nombre_Worker = await pool.query('SELECT worker_name FROM trabajador WHERE worker_rut = ? AND user_id = ?',[rut_trabajador,req.user.id]);
    const nombre = nombre_Worker[0].worker_name;
    console.log(nombre);

    const apellido_worker = await pool.query('SELECT worker_surname FROM trabajador WHERE worker_rut = ? and user_id = ?',[rut_trabajador, req.user.id]);
    const apellido = apellido_worker[0].worker_surname;
    console.log(apellido);

    const new_worked = {
        rut_trabajador,
        sector_trabajo,
        seccion_ligada,
        mes,
        ano,
        nombre,
        apellido,
        fecha_trabajada,
        horas_trabajadas
    };
    await pool.query('UPDATE trabajador_sector SET ? WHERE id = ? AND user_id = ?',[new_worked,id,req.user.id]);
    res.redirect('/sector_worker');
    }
    else
    {
        const value_error = 'workered_not_found';
        const type_err = 'ERROR 404';
        const content_error = 'verify the id from the url, the id doesn´t exist';
        res.status(404).render('errors/error',{value_error,type_err,content_error});
    }
});

router.get('/delete/:id', isLoggedIn, async (req,res) => {
    const {id} = req.params;

    const if_exist = await pool.query('SELECT * FROM trabajador_sector WHERE id = ? AND user_id = ?',[id,req.user.id]);
    if(if_exist.length>0)
    {
        await pool.query('DELETE FROM trabajador_sector WHERE id = ? AND user_id = ?',[id,req.user.id]);
        req.flash('success','Sector Worker Removed Successfully'); 
        res.redirect('/sector_worker');
    }
    else
    {
        const value_error = 'workered_not_found';
        const type_err = 'ERROR 404';
        const content_error = 'verify the id from the url, the id doesn´t exist';
        res.status(404).render('errors/error',{value_error,type_err,content_error});
    }
});

router.post('/add', isLoggedIn, async (req,res) => {
    const {rut_trabajador,sector_trabajo,seccion, dia, mes, ano, fecha_trabajada, horas_trabajadas} = req.body;

    const seccion_id = await pool.query('SELECT id FROM seccion WHERE descripcion = ?',[seccion]);
    const seccion_ligada = seccion_id[0].id;

    const nombre_Worker = await pool.query('SELECT worker_name FROM trabajador WHERE worker_rut = ?',[rut_trabajador]);
    const nombre = nombre_Worker[0].worker_name;

    const apellido_worker = await pool.query('SELECT worker_surname FROM trabajador WHERE worker_rut = ?',[rut_trabajador]);
    const apellido = apellido_worker[0].worker_surname;

    const new_worked = {
        rut_trabajador,
        sector_trabajo,
        seccion_ligada,
        mes,
        ano,
        nombre,
        apellido,
        fecha_trabajada,
        horas_trabajadas,
        seccion,
        user_id: req.user.id
    };

    await pool.query('INSERT INTO trabajador_sector SET ?',[new_worked]);
    req.flash('success','Sector Worker Added Successfully'); 
    res.redirect('/sector_worker');
});

//this in the case of error in position link
router.get('*',(req,res) => {
    const value_error = 'URL_not_found';
    const type_err = 'ERROR 404';
    const fullUrl = (req.protocol + '://' + req.get('host') + req.originalUrl);
    const content_error = 'Verify the url '+fullUrl;
    res.status(404).render('errors/error',{value_error,type_err,content_error});
});

//this element is the export of the router object
module.exports = router;