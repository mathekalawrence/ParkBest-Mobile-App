const express = require('express');

const cors = require('cors');

const mysql = require('mysql2');

const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

//Middleware
app.use(cors());
app.use(bodyParser.json());

//Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'parkbest_db',
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed!:', err);

    } else {
        console.log('Connection to database successful');
    }
});

//Routes

// Testing Routes
app.get('/', (req, res) => {
    res.send('Express and MySQL API running');

});