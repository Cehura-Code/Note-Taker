const express = require('express');
const path = require('path');
const fs = require('fs');
// generates unique ids
const uuid = require('./helpers/uuid')

const app = express();

// reference: Module 11 Activity 2 Student Setup
const PORT = process.env.PORT || 3001;

// Middleware for parsing application/json and urlencoded data (MODULE 11 - INSTRUCTOR CODE 15)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// pulls files from public folder
// reference: "Serving static files in Express" Express: https://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// edited get methods to define the routes for the landing/notes page
// reference: Module 11 Activty 4: API HTML routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).json(err);
        } else {
            // Convert string into JSON object
            const parsedNotes = JSON.parse(data);
            res.status(200).json(parsedNotes);
        }
    });
});

// reference: "Express.js – app.delete() Method" Tutorials Point: https://www.tutorialspoint.com/express-js-app-delete-method
// colon is a placeholder for the route to choose any of the object in the array based off the id
app.delete('/api/notes/:id', (req, res) => {
    // elete request received
    console.info(`${req.method} request received to delete a note`);
  
    // reference: "req.query and req.param in ExpressJS" Stack Overflow: https://stackoverflow.com/questions/18524125/req-query-and-req-param-in-expressjs
    // the request pulls the object based of the id so it knows which note to delete
    const noteId = req.params.id;
  
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        res.status(500).json(err);
      } else {
        // Converts string into JSON object
        const parsedNotes = JSON.parse(data);
        // takes the deleted note out of the array from the other notes
        const updatedNotes = parsedNotes.filter((note) => note.id !== noteId);
  
        fs.writeFile('./db/db.json', JSON.stringify(updatedNotes), (err, data) => {
          if (err) {
            res.status(500).json(err);
          } else {
            res.status(200).json({ status: 'success' });
          }
        });
      }
    });
  });

//   post request to add a note
app.post('/api/notes', (req, res) => {
    // log that post was received
    console.info(`${req.method} request received to add a note`);

    // destructure for items in req.body
    const { title, text } = req.body;

    // if note title and text are/are not entered:
    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid(),
        };

        const userNote = {
            status: 'success',
            body: newNote,
        };
        console.log(userNote);
        // reference: "HTTP response status codes" mdm web docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
        // 201 = 'created'
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                res.status(500).json(err);
            } else {
                // Convert string into JSON object
                const parsedNotes = JSON.parse(data);
                parsedNotes.push(newNote);
                fs.writeFile('./db/db.json', JSON.stringify(parsedNotes), (err, data) => {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(201).json(newNote);
                    }
                });
            }
        });
    } else {
        // bad request = 400
        res.status(400).json('Enter a title and text for your note');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
