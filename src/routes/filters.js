//in this lines are defined the objects to muse in this route, and a element named route is defined to navigate routes
const express = require('express');
const router = express.Router();

const pool = require('../database');

const { isLoggedIn } = require('../lib/auth');

router.get('/',isLoggedIn, async (req,res) => {
    const sector = await pool.query('SELECT * FROM sector WHERE user_id = ?',[req.user.id]);
    console.log(sector);
    const worker = await pool.query('SELECT * FROM trabajador WHERE user_id = ?',[req.user.id]);
    console.log(worker);
    const section = await pool.query('SELECT * FROM seccion WHERE user_id = ?',[req.user.id]);
    console.log(section);
    res.render('filters/filters',{sector, worker, section});
});

router.get('/sectors_filtered', isLoggedIn, async (req,res) => {
    const sector_get = req.query.sector_trabajo;
    const relationed_sectors = await pool.query('SELECT * FROM trabajador_sector WHERE sector_trabajo = ? AND user_id = ?',[sector_get,req.user.id]);

    let totalesHoras = await pool.query('SELECT SUM(horas_trabajadas) AS suma_total_horas FROM trabajador_sector WHERE sector_trabajo = ? AND user_id = ?',[sector_get, req.user.id]);
    console.log(totalesHoras);
    console.log(relationed_sectors);
    res.render('filters/sectors_filtered',{relationed_sectors,totalesHoras});
});

router.get('/workers_filtered', isLoggedIn, async (req,res) => {
    console.log(req.query);
    const worker_get = req.query.rut_trabajador;
    const relationed_workers = await pool.query('SELECT * FROM trabajador_sector WHERE rut_trabajador = ? AND user_id = ?',[worker_get, req.user.id]);
    let totalesHoras = await pool.query('SELECT SUM(horas_trabajadas) AS suma_total_horas FROM trabajador_sector WHERE rut_trabajador = ? AND user_id = ?',[worker_get, req.user.id]);
    console.log(relationed_workers);
    res.render('filters/workers_filtered',{relationed_workers, totalesHoras});
});

router.get('/date_filtered', isLoggedIn, async (req,res) => {
    console.log(req.query);
    const month_get = req.query.mes;
    const year_get = req.query.ano;

    let month_name = "";
    if(month_get == "1")
    {
        month_name = "enero";
    }
    else if(month_get == "2")
    {
        month_name = "febrero";
    }
    else if(month_get == "3")
    {
        month_name = "marzo";
    }
    else if(month_get == "4")
    {
        month_name = "abril";
    }
    else if(month_get == "5")
    {
        month_name = "mayo";
    }
    else if(month_get == "6")
    {
        month_name = "junio";
    }
    else if(month_get == "7")
    {
        month_name = "julio";
    }
    else if(month_get == "8")
    {
        month_name = "agosto";
    }
    else if(month_get == "9")
    {
        month_name = "septiembre";
    }
    else if(month_get == "10")
    {
        month_name = "octubre";
    }
    else if(month_get == "11")
    {
        month_name = "noviembre";
    }
    else if(month_get == "12")
    {
        month_name = "diciembre";
    }

    const relationed_date = await pool.query('SELECT * FROM trabajador_sector WHERE mes = ? AND ano = ? AND user_id = ?',[month_get,year_get, req.user.id]);
    console.log(relationed_date);

    let totalesHoras = await pool.query('SELECT SUM(horas_trabajadas) AS suma_total_horas FROM trabajador_sector WHERE mes = ? AND ano = ? AND user_id',[month_get,year_get, req.user.id]);
    
    if(month_get == [] || year_get == [])
    {
        relationed_date = [];
        month_name = "";
        year_get = "";
    }

    res.render('filters/date_filtered',{relationed_date,month_name,year_get,totalesHoras});
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