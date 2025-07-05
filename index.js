require('dotenv').config(); // Load environment variables

const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 5000;
const API_NINJAS_KEY = process.env.API_NINJAS_KEY;

const cors = require('cors');
const { generateItinerary } = require('./gemini'); // Import the itinerary generation function

// Middleware
app.set('trust proxy', 1); // trust first proxy

app.use(cors({ origin: "https://globular-info.vercel.app" })); // Enable CORS
app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Globular Info API');
});

app.get('/api/wake', async (req, res) => {
  try {
    // Optional: Run pre-warm tasks like DB ping, cache boot, etc.
    console.log('Frontend pinged wake-up endpoint.');

    res.status(200).json({ status: 'Backend is awake.' });
  } catch (error) {
    console.error('Error during wake-up:', error.message);
    res.status(500).json({ error: 'Backend failed to wake.' });
  }
});


app.get('/api/place-history', async (req, res) => {
  const { place } = req.query;

  if (!place) {
    return res.status(400).json({ error: 'Missing place name' });
  }

  try {
    const response = await axios.get(`https://api.api-ninjas.com/v1/historicalevents?text=${place}`, {
      headers: { 'X-Api-Key': API_NINJAS_KEY }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching historical facts:', error.message);
    res.status(500).json({ error: 'Failed to fetch historical facts' });
  }
});

app.post('/api/location', async (req, res) => {
  const {longitude, latitude} = req.body;

  if (!longitude || !latitude) {
    return res.status(400).json({ error: 'Missing lat or lon' });
  }

  try {
    const response = await axios.get(`https://api.api-ninjas.com/v1/reversegeocoding?lat=${latitude}&lon=${longitude}`, {
      headers: { 'X-Api-Key': API_NINJAS_KEY }
    });
    console.log(response.data);
    console.log(response.data[0]);
    res.json(response.data[0]);
  } catch (error) {
    console.error('Error fetching location:', error.message);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

app.post('/api/weather', async (req, res) => {
  const {longitude, latitude} = req.body;

  if (!longitude || !latitude) {
    return res.status(400).json({ error: 'Missing lat or lon' });
  }

  try {
    const response = await axios.get(`https://api.api-ninjas.com/v1/weather?lat=${latitude}&lon=${longitude}`, {
      headers: { 'X-Api-Key': API_NINJAS_KEY }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching location:', error.message);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

app.post("/api/generate-itinerary", async (req, res) => {
  const address = req.body; // expects { name, country, state }
  try {
    const itinerary = await generateItinerary(address);
    res.json(itinerary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});