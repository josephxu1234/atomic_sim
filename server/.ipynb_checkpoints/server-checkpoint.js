// server.js

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Endpoint to save the graph data
app.post('/saveGraph', (req, res) => {
    const graphData = req.body;

    // Save the graph data to a text file
    fs.writeFile('graph.txt', JSON.stringify(graphData, null, 2), (err) => {
        if (err) {
            console.error('Error saving graph:', err);
            res.status(500).json({ message: 'Error saving graph data.' });
        } else {
            console.log('Graph data saved successfully.');

            // Log the source-sink pairs
            if (graphData.sourceSinkPairs) {
                console.log('Source-Sink Pairs:', graphData.sourceSinkPairs);
            }

            res.json({ message: 'Graph data saved successfully.' });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
