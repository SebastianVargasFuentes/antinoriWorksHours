//in this lines are defined the objects to muse in this route, and a element named route is defined to navigate routes
const express = require('express');
const router = express.Router();

const pool = require('../database');

const { isLoggedIn } = require('../lib/auth');

//This is the case are yoy stay in localhost:4000/sections/add
router.get('/add', isLoggedIn,(req,res) => {
    res.render('sections/add');
});

//This is the case of the user add a new section
router.post('/add', isLoggedIn, async (req,res) => {
    //obtain the description in the body
    const {descripcion} = req.body;
    //make a new object to insert a database
    const new_section = {
        descripcion,
        user_id: req.user.id
    };

    //this query verify the sector not repeat
    const verify_desc = await pool.query('SELECT * FROM seccion WHERE descripcion = ? AND user_id = ?',[descripcion, req.user.id]);

    //if the case the length of the result its more than 0, the section exists, if the lenght its lower than 0, no exist
    if (verify_desc.length > 0) 
    {    
        //send a message to say the user the seccion repeat
        req.flash('message','The Section Exists, Choose another');
        //redirect to /sections link 
        res.redirect('/sections');
    }
    else
    {
        //this is the case of the section doesnt exist
        //script to add the database
        await pool.query('INSERT INTO seccion set ?',[new_section]);
        //send a message to say the section added successfully
        req.flash('success','Section Added Successfully');
        //redirect to /sections link
        res.redirect('/sections');
    }
});

//this is the case oof the user stay in root of sections (/sections)
router.get('/', isLoggedIn, async (req,res) => {
    //query to get all sections
    const sections = await pool.query('SELECT * FROM seccion WHERE user_id = ?',[req.user.id]);
    //render a view with the values
    res.render('sections/list',{sections});
});

//this is the case to the user press a section to see the works
router.get('/:descripcion', isLoggedIn, async (req,res) => {
    //get the description of the a element in the params
    const {descripcion} = req.params;
    //verify the section exist to see the works
    const section_name = await pool.query('SELECT descripcion FROM seccion WHERE descripcion = ? AND user_id = ?',[descripcion, req.user.id]);
    
    //in the case of the section exists, the size of the result its more than 0, if doesnt exist, the size of result = 0
    if (section_name.length > 0) 
    {    
        //get the id of the section with the description, this is to find works with the id, FOREIGN KEY
        const id_section = await pool.query('SELECT id FROM seccion WHERE descripcion = ? AND user_id = ?',[descripcion, req.user.id]);
        //get the value of the id (the number) to find the tasks, named id
        const id = id_section[0].id;
        //find the task where the seccion_ligada value its equals to id
        const works_at_section = await pool.query('SELECT * FROM trabajador_sector where seccion_ligada = ? AND user_id = ?',[id,req.user.id]);
        console.log(works_at_section);
        let totalHoras = await pool.query('SELECT SUM(horas_trabajadas) AS suma_horas FROM trabajador_sector where seccion_ligada = ? AND user_id = ?',[id,req.user.id]);
        
        console.log(totalHoras);
        if(totalHoras[0].suma_horas == null)
        {
            totalHoras = "";
        }

        let totalHorasSumadas = await pool.query('SELECT sector_trabajo,SUM(horas_trabajadas) AS total_horas_seccion FROM trabajador_sector  where seccion_ligada = ? AND user_id = ? group by sector_trabajo',[id,req.user.id]);
        //let totalWorkersSection = await pool.query('SELECT rut_trabajador FROM trabajador_sector  WHERE seccion_ligada = ? group by rut_trabajador',[id]);

        console.log('the count hous',totalHorasSumadas);
        
        //render a view to all tasks
        res.render('sections/all_tasks',{works_at_section, totalHoras, totalHorasSumadas, /*totalWorkersSection*/});
    }
    else
    {
        //send a error view in the case of the section doesnt exists with the message and the type
        const value_error = 'workered_not_found';
        const type_err = 'ERROR 404';
        const content_error = 'verify the id from the url, the id doesn´t exist';
        res.status(404).render('errors/error',{value_error,type_err,content_error});
    }
});

//this is the case of the user delete a section 
router.get('/delete/:id', isLoggedIn, async (req,res) => {
    //get the id in the params
    const {id}  = req.params;
    //verify if the section exists to delete the section, the value section_id contains a value in the case of the section
    //exist
    const section_id = await pool.query('SELECT id FROM seccion WHERE id = ? AND user_id = ?',[id,req.user.id]);
    //if the case of the section exist, the size is more than 0, in the case of the section doesnt exist the lenght its 0
    if (section_id.length > 0) 
    {    
        //delete the section with the id
        await pool.query('DELETE FROM trabajador_sector WHERE seccion_ligada = ? AND user_id = ?',[id,req.user.id]);
        await pool.query('DELETE FROM seccion WHERE id = ?',[id]);
        //this link its comented, if the section delete, delete the works
        
        //message to say the section is deleted
        req.flash('success','Section Deleted Successfully');
        //redirect to /sections link
        res.redirect('/sections');
    }
    else
    {
        //this is the case of the sector doesnt exists
        //set a message and tht type
        const value_error = 'workered_not_found';
        const type_err = 'ERROR 404';
        const content_error = 'verify the id from the url, the id doesn´t exist';
        res.status(404).render('errors/error',{value_error,type_err,content_error});
    }
});

//this is the case od the user press a link of the edit
router.get('/edit/:id', isLoggedIn, async (req,res) => {
    //get the id in the params
    const {id} = req.params;
    //verify if the section exists, this is to get the element with the id, if exists, return a size more than 0, if
    //doesnt exists, return the size equals to 0
    const section_id = await pool.query('SELECT id FROM seccion WHERE id = ? and user_id = ?',[id, req.user.id]);
    
    //if the lenght of the result its more than 1, the section exists, in other case , the section doesnt exists 
    if (section_id.length > 0) 
    {    
        //if the size is more than 0, find the user to modify and send this values to other view with render
        const section = await pool.query('SELECT * FROM seccion WHERE id = ? AND user_id = ?',[id, req.user.id]);
        //render a view with the values , the section: section[0] is to get the values, not the object
        res.render('sections/edit',{section: section[0]});
    }
    else
    {
        const value_error = 'section_not_found';
        const type_err = 'ERROR 404';
        const content_error = 'verify the id from the url, the id doesn´t exist';
        res.status(404).render('errors/error',{value_error,type_err,content_error});
    }
});

//this in the case of the user modify the section
router.post('/edit/:id', isLoggedIn, async (req,res) => {
    //get the id in the params
    const {id} = req.params;
    //get the descripcion in the body
    const {descripcion} = req.body;
    //make a new object to modify
    const new_section = {
        descripcion,
        user_id: req.user.id
    };

    const object_worker_relationed = {
        seccion: descripcion,
        user_id: req.user.id
    };

    //verify if the section exists, this return a element, if exists a value, the size its more than 0, if 
    //doesnt exists a section, return a size equal to 0
    const verify_desc = await pool.query('SELECT * FROM seccion WHERE descripcion = ? AND user_id = ?',[descripcion, req.user.id]);

    //if the size of the result its more than 1, there is a section, if the lenght its 0, doesnt exists a section
    if (verify_desc.length > 0) 
    {    
        //if the section exists, return with a error message
        //note: this error start when the user modify the name where the name exits
        req.flash('message','The Section Exists'); 
        //return to sections
        res.redirect('/sections');
    }
    else
    {
        //this is the case of the desciption at modify is not equal to another section
        //update the section with the new object and the id
        await pool.query('UPDATE seccion SET ? WHERE id = ?',[new_section,id]);
        
        console.log(descripcion);
        //let seccion = descripcion;
        await pool.query('UPDATE trabajador_sector SET ? WHERE seccion_ligada = ?',[object_worker_relationed,id]);
        //this is a message to notify the  edit its successfully
        req.flash('success','Section Edited Successfully');
        //redirect to /sections link
        res.redirect('/sections');
    }

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