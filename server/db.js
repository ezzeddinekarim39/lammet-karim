const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',      // Or your Cloud Host URL
    user: 'root',           // Your MySQL username
    password: '',   // Your MySQL password
    database: 'lammet_karim'
});

module.exports = db.promise();