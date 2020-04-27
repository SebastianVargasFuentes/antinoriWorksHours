//in this lines are defined the objects to muse in this route, and a element named route is defined to navigate routes
const express = require('express');
const router = express.Router();

var nodemailer = require('nodemailer');

//In element is the pool, to make actions to database
const pool = require('../database');

//Thsi element is to verify is the user is logged
const { isLoggedIn } = require('../lib/auth');

//This is the case are yoy stay in localhost:4000/sectors/add
router.get('/add', isLoggedIn,(req,res) => {
    res.render('sectors/add');
});

//this is the case of the user send a values with the form
router.post('/add', isLoggedIn, async (req,res) => {
    //get the values of the request.body
    const {sector_name, sector_price, sector_state} = req.body;

    //here are setting a new objext with values
    const new_sector = {
        sector_name,
        sector_price,
        sector_state,
        user_id: req.user.id
    };

    //verify if the sector exists with the id of the user
    const verify_sector = await pool.query('SELECT * FROM sector WHERE sector_name = ? AND user_id = ?',[sector_name, req.user.id]);

    //verify if the length pf the result its more than 0
    if (verify_sector.length > 0) 
    {   
        //This is the case of the sector exists
        req.flash('message','The Sector Already Exists'); 
        res.redirect('/sectors');
    }
    else
    {
        /*
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'sebastianfuentes123@gmail.com',
              pass: 'perrobobi'
            }
          });
          
          var mailOptions = {
            from: 'sebastianfuentes123@gmail.com',
            to: 'mycake302@gmail.com',
            subject: 'Sending Email using Node.js',
            html: '<a href="https://www.google.com" class="btn btn-outline-success">See Google!</a>'
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
*/
        //Query to set the values in DataBase, this case of the sector is new
        await pool.query('INSERT INTO sector set ?',[new_sector]);
        req.flash('success','Sector Saved Successfully');
        res.redirect('/sectors');
    }
});

//This is the link of all sectors 
router.get('/', isLoggedIn, async (req,res) => {
    //query to get the sectors with the user
    const sectors = await pool.query('SELECT * FROM sector WHERE user_id = ?',[req.user.id]);

    //const sectors_ordered = await pool.query('SELECT ')
    //const chart_value =  await pool.query('SELECT rut_trabajador, SUM(horas_trabajadas) AS suma_horas  FROM trabajador_sector WHERE user_id = ? group by rut_trabajador',[req.user.id]);
    
    const sectored_hours = await pool.query('SELECT sector_trabajo, SUM(horas_trabajadas) AS suma_horas FROM trabajador_sector WHERE user_id = ? group by sector_trabajo order by suma_horas DESC',[req.user.id]);

    //send to all sectors
    res.render('sectors/list',{sectors,sectored_hours});
});

//this is the case of the user get a view to delete 
router.get('/delete/:id', isLoggedIn, async (req,res) => {
    //get the id in the params
    const { id } = req.params;

    //get a value to verify id the sector exists
    const sector_title = await pool.query('SELECT sector_name FROM sector WHERE id = ?',[id]);
    
    //if the length of the value its 0, the sector doesnt exist
    if(sector_title.length > 0) 
    {    
        const sector_trabajo = sector_title[0].sector_name;
        //query to delete the sector with his id, and other query to delete the task
        await pool.query('DELETE FROM sector WHERE id = ?',[id]);
        await pool.query('DELETE FROM trabajador_sector WHERE sector_trabajo = ?',[sector_trabajo]);
        //redirect a other link, the sectors
        req.flash('success','Sector Deleted Successfully');
        res.redirect('/sectors');
    }
    else
    {
        //send a error message with the error
        const value_error = 'sector_not_found';
        const type_err = 'ERROR 404';
        const content_error = 'verify the id from the url, the id doesn´t exist';
        res.status(404).render('errors/error',{value_error,type_err,content_error});
    }
});

//This is the case of the user get a view of the edir sector
router.get('/edit/:id', isLoggedIn, async (req,res) => {
    //get the id in the params
    const {id} = req.params;

    //get the value of the table sector, to verify if exist the sector
    const sector_title = await pool.query('SELECT sector_name FROM sector WHERE id = ?',[id]);
    
    //verify if the sector exists
    if(sector_title.length > 0) 
    {    
        //send the values to the post view to modify
        const sector = await pool.query('SELECT * FROM sector WHERE id = ?',[id]);
        //send the values
        res.render('sectors/edit',{sector: sector[0]});
    }
    else
    {
        //send a error, in the case of the sector doesnt exist
        const value_error = 'sector_not_found';
        const type_err = 'ERROR 404';
        const content_error = 'verify the id from the url, the id doesn´t exist';
        res.status(404).render('errors/error',{value_error,type_err,content_error});
    }
});

//this is the case of the user modify the sector
router.post('/edit/:id', isLoggedIn, async (req,res) => {
    //get the id in params
    const {id} = req.params;

    //get the values in the body 
    const {sector_name, sector_price, sector_state, name_for_edit} = req.body;

    //make a new object with the values named new_sector
    const new_sector = {
        sector_name,
        sector_price,
        sector_state
    };

    const update_sector_worker = {
        sector_trabajo: sector_name
    };

    //verify if the user modify the name with one existing
    const verify_sector = await pool.query('SELECT * FROM sector WHERE sector_name = ?',[sector_name]);

    //verify the user not put a same name of a existing sector
    if (verify_sector.length > 0) 
    {   
        //send a message to say the sector name exist
        req.flash('message','The sector name alrady exist'); 
        res.redirect('/sectors');
    }
    else
    {
        //edit the sector with the values
        let sector_trabajo = name_for_edit;
        //edit the sector table and the trabajador_sector table
        await pool.query('UPDATE sector SET ? WHERE id = ?',[new_sector,id]);
        await pool.query('UPDATE trabajador_sector SET ? WHERE sector_trabajo = ?',[update_sector_worker,sector_trabajo]);
        //set a message with successfully message

        req.flash('success','Sector Edited Successfully');
        res.redirect('/sectors');
    }
});

router.get('*',(req,res) => {
    //send a error, in the case of the url doesnt exist
    const value_error = 'URL_not_found';
    const type_err = 'ERROR 404';
    const fullUrl = (req.protocol + '://' + req.get('host') + req.originalUrl);
    const content_error = 'Verify the url '+fullUrl;
    res.status(404).render('errors/error',{value_error,type_err,content_error});
});

//this element is the export of the router object
module.exports = router;