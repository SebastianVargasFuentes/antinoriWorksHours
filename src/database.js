//import the mysql module, to set the connection with the database
const mysql = require('mysql');
const { promisify } = require('util');

//in this line, i import the object named database, this object cointain a credentials of my database, and user
const { database } = require('./keys');

//create the pool, to connection, and the object named pool is created, to use this connection
const pool = mysql.createPool(database);

pool.getConnection((error, connection) => {
    if(error)
    {
        if(error.code === 'PROTOCOL_CONNECTION_LOST')
        {
            console.error('THE CONNECTION TO DATABASE IS CLOSED');
        }

        if(error.code === 'ER_CON_COUNT_ERROR')
        {
            console.error('THE DATABASE HAS TO MANY CONNECTIONS');
        }

        if(error.code === 'ECONNREFUSED')
        {
            console.error('DATABASE CONNECTION WAS REFUSED');
        }   
    }

    if(connection)
    {
        connection.release();
        console.log('DATABASE IS CONNECTED');
        return;
    }

});

//promisify pool querys
pool.query = promisify(pool.query);

module.exports = pool;