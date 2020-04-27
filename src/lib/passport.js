const passport = require('passport');
const LocalStategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');

passport.use('local.signin', new LocalStategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req,username,password,done) => {
    const rows = await pool.query('SELECT * FROM users WHERE username = ?',[username]);
    if(rows.length>0)
    {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(password,user.password);
        if(validPassword)
        {
            done(null,user,req.flash('success','Bienvenido ' + user.username));
        }
        else
        {
            done(null,false,req.flash('message','Contraseña Incorrecta'));
        }
    }
    else
    {
        return done(null,false,req.flash('message','El username no existe'));
    }
}));

passport.use('local.signup', new LocalStategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req,username,password,done) => {

    const {fullname,confirm_password} = req.body;

    if(password == confirm_password)
    {
        const newUser = {
        username,
        password,
        fullname
    };

    newUser.password = await helpers.encryptPassword(password);

    const result = await pool.query('INSERT INTO users SET ?',[newUser]);
    newUser.id = result.insertId;
    return done(null,newUser);
    }
    else
    {
        done(null,false,req.flash('message','las contraseñas no coinciden'));
    }

    
}));


passport.serializeUser((user,done) => {
    done(null,user.id);
});

passport.deserializeUser( async (id, done) => {
    const rows = await pool.query('SELECT * FROM users WHERE id = ?',[id]);
    done(null, rows[0]);
});

