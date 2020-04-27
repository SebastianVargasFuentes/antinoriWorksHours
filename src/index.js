//this lines are require modules to use better the app
const express = require('express');
const morgan = require('morgan');
const express_handlebars = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySqlStore = require('express-mysql-session');
const {database} = require('./keys');
const passport = require('passport');

//initialitions, i definy a const called app, this app contains a express
const app = express();
require('./lib/passport');


// ****** SETTINGS ******
//in this line, definy the element named port, and this contains the name of the port
app.set('port',process.env.PORT || 4000);

//in this line definy a element named views and this contains the place of the folder named views
app.set('views',path.join(__dirname, 'views'));

//in this line definy a handlebars named .hbs, this app use a handlebars, and this is the configurations
app.engine('.hbs',express_handlebars({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));

//in this line, the app are configured to use .hbs element
app.set('view engine','.hbs');



// ****** MIDLEWARES ******
//in this line the morgan is used to see the petitions to the server
app.use(session({
    secret: 'session',
    resave: false,
    saveUninitialized: false,
    store: new MySqlStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());


// ****** GLOBAL VARIABLES ******
//in this line obtain the user to continue the next funcion, is to access to another location
app.use((req,res,next) => {
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.user = req.user;
    next();
});


// ****** ROUTES ******
//in this line the index file located in routes contain the root location
//also is defined the authentication, sectors, sections, workers, work_asigned (the last one is when the worker
//is asigned a job)
app.use(require('./routes/index')); //--> is before to login, the welcome
app.use(require('./routes/authetication')); //--> the authentication, the login
app.use('/sectors',require('./routes/sectors')); //--> the sectors, all sectors crud
app.use('/sections',require('./routes/sections')); //--> the sections, crud
app.use('/workers',require('./routes/workers'));// --> the workers, crud
app.use('/sector_worker',require('./routes/sector_worker'));//--> the sector_worker, crud
app.use(require('./routes/error'));//--> to handle errors
app.use('/charts',require('./routes/charts'));//--> see charts, to see a graphics
app.use('/filters',require('./routes/filters'));//--> see charts, to see a graphics
app.use(require('./routes/main_menu'));//--> the main menu, the options


// ****** PUBLIC ******
app.use(express.static(path.join(__dirname,'public')));


// ****** STARTING THE SERVER ******
//in this line the server is up, with the port named 'port', and the connection is ok, send a message in console
app.listen(app.get('port'), () => {
    console.log('the server is up in port',app.get('port'));
});