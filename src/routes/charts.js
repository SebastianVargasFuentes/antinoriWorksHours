
  //in this lines are defined the objects to muse in this route, and a element named route is defined to navigate routes
const express = require('express');
const router = express.Router();

const pool = require('../database');

const { isLoggedIn } = require('../lib/auth');

router.get('/', isLoggedIn, async (req,res) => {
    const chart_value =  await pool.query('SELECT rut_trabajador, SUM(horas_trabajadas) AS suma_horas  FROM trabajador_sector WHERE user_id = ? group by rut_trabajador',[req.user.id]);
    console.log(chart_value);

    const chart_value2 =  await pool.query('SELECT sector_trabajo, SUM(horas_trabajadas) AS suma_horas  FROM trabajador_sector WHERE user_id = ? group by sector_trabajo',[req.user.id]);
    console.log(chart_value2);

    var date = new Date();
    var year = date.getFullYear();

    const chart_value3 =  await pool.query('SELECT sector_trabajo, SUM(horas_trabajadas) AS suma_horas  FROM trabajador_sector WHERE ano = ? and user_id = ? group by sector_trabajo',[year,req.user.id]);

    const total_hours_year =  await pool.query('SELECT SUM(horas_trabajadas) AS suma_horas  FROM trabajador_sector WHERE ano = ? and user_id = ?',[year,req.user.id]);

    res.render('charts/charts',{chart_value,chart_value2,chart_value3,total_hours_year});
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