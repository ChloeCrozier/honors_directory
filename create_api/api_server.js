const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());

// Adjust the path to point to the 'create_db' folder
const dbPath = path.join(__dirname, '../create_db/student_data.db');
const db = new sqlite3.Database(dbPath);

// Adjust the path to point to the 'public' folder
app.use(express.static(path.join(__dirname, '../user_Search/public')));

// Update your API endpoint to handle tokenized search
app.get('/api/honorsData/:name', (req, res) => {
    const { name } = req.params;

    // Tokenize the input name
    const searchTokens = name.toLowerCase().split(' ');

    // Use prepared statements to prevent SQL injection
    const query = `
        SELECT name, year, 
               COALESCE(fall, 'N/A') AS fall, 
               COALESCE(spring, 'N/A') AS spring 
        FROM student_data 
        WHERE ${searchTokens.map(token => `LOWER(name) LIKE '%${token}%'`).join(' AND ')}
    `;

    db.all(query, (err, rows) => {
        if (err) {
            console.error('Error executing database query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('Rows:', rows); // Add this line for debugging
            res.json(rows);
        }
    });
});

// How to restart the server: cd create_api ; lsof -i :3000 ; kill -9 $(lsof -t -i:3000) ; node api_server.js
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});