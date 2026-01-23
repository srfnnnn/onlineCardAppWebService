//include the required pacakges
const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;

//database config info
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnection: true,
    connectionLimit: 100,
    queueLimit: 0,
};

//initialize Express app
const app = express();
app.use(express.json());


const cors = require("cors"); 
 
const allowedOrigins = [ 
  "http://localhost:3000", 
  // "https://YOUR-frontend.vercel.app",   // add later 
  // "https://YOUR-frontend.onrender.com"  // add later 
]; 
 
app.use( 
  cors({ 
    origin: function (origin, callback) { 
      // allow requests with no origin (Postman/server-to-server) 
      if (!origin) return callback(null, true); 
 
      if (allowedOrigins.includes(origin)) { 
        return callback(null, true); 
      } 
      return callback(new Error("Not allowed by CORS")); 
    }, 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    allowedHeaders: ["Content-Type", "Authorization"], 
    credentials: false, 
  }) 
);

//start the server
app.listen(port, () => {
    console.log('Server running on port', port);
});


//Example Route: Get all cards
app.get('/allcards', async (req,res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM defaultdb.cards');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error for allcards'});
    }
});

app.post('/addcard', async (req, res) => {
    const { card_name, card_pic } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);

        // Insert the card
        const [result] = await connection.execute(
            'INSERT INTO cards (card_name, card_pic) VALUES (?, ?)',
            [card_name, card_pic]
        );

        // result.insertId contains the new card's ID
        const newCard = {
            id: result.insertId,
            card_name,
            card_pic
        };

        res.status(201).json(newCard); // Return the new card object
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not add card '+card_name });
    }
});


//Example Route: Create a new card
// app.post('/addcard', async (req,res) => {
//     const { card_name, card_pic } = req.body;
//     try {
//         let connection = await mysql.createConnection(dbConfig);
//         await connection.execute('INSERT INTO cards (card_name, card_pic) VALUES (?, ?)', [card_name, card_pic]);
//         res.status(201).json({message: 'Card '+card_name+' added successfully'});
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({message: 'Server error - could not add card '+card_name});
//     }
//  });

// Update card using POST
// app.post('/editcard/:id', async (req, res) => {
//     const id = req.params.id;
//     const { card_name, card_pic } = req.body;

//     try {
//         let connection = await mysql.createConnection(dbConfig);

//         const [result] = await connection.execute(
//             `UPDATE cards 
//              SET card_name = ?, card_pic = ?
//              WHERE id = ?`,
//             [card_name, card_pic, id]
//         );

//         if (result.affectedRows === 0) {
//             res.status(404).json({ message: 'Card not found' });
//         } else {
//             res.json({ message: 'Card updated successfully' });
//         }
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error - could not update card' });
//     }
// });

app.put('/editcard/:id', async (req, res) => {
    const id = req.params.id;
    const { card_name, card_pic } = req.body;

    try {
        let connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute(
            `UPDATE cards
             SET card_name = ?, card_pic = ?
             WHERE id = ?`,
            [card_name, card_pic, id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Card not found' });
        } else {
            res.json({ message: 'Card updated successfully' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not update card' });
    }
});
//
// Fetch one card by ID
app.get('/editcard/:id', async (req, res) => {
    const id = req.params.id;
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            `SELECT * FROM cards WHERE id = ?`,
            [id]
        );

        if (rows.length === 0) {
            res.status(404).json({ message: 'Card not found' });
        } else {
            res.json(rows[0]); // send the single card
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not fetch card' });
    }
});


// DELETE a card by ID
app.delete('/deletecard/:id', async (req, res) => {
    const id = req.params.id;
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'DELETE FROM cards WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Card not found' });
        } else {
            res.json({ message: 'Card deleted successfully' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not delete card' });
    }
});

// app.put('/updatecard/:id', async (req, res) => {
//     const { id } = req.params;
//     const { card_name, card_pic } = req.body;
//     try{
//         let connection = await mysql.createConnection(dbConfig);
//         await connection.execute('UPDATE cards SET card_name=?, card_pic=? WHERE id=?', [card_name, card_pic, id]);
//         res.status(201).json({ message: 'Card ' + id + ' updated successfully!' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error - could not update card ' + id });
//     }
// });
//
// // Example Route: Delete a card
// app.delete('/deletecard/:id', async (req, res) => {
//     const { id } = req.params;
//     try{
//         let connection = await mysql.createConnection(dbConfig);
//         await connection.execute('DELETE FROM cards WHERE id=?', [id]);
//         res.status(201).json({ message: 'Card ' + id + ' deleted successfully!' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error - could not delete card ' + id });
//     }
// });


