const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get directions to parking spot
router.get('/directions', async (req, res) => {
  try {
    const { origin, destination } = req.query;

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ error: 'Google Maps API not configured' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin,
        destination,
        key: process.env.GOOGLE_MAPS_API_KEY,
        mode: 'driving',
        traffic_model: 'best_guess',
        departure_time: 'now'
      }
    });

    if (response.data.status !== 'OK') {
      return res.status(400).json({ error: 'Directions not found' });
    }

    const route = response.data.routes[0];
    
    res.json({
      duration: route.legs[0].duration,
      distance: route.legs[0].distance,
      steps: route.legs[0].steps.map(step => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
        distance: step.distance.text,
        duration: step.duration.text
      })),
      polyline: route.overview_polyline.points
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get directions' });
  }
});

// Get nearby places (restaurants, shops, etc.)
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, type = 'restaurant' } = req.query;

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${lat},${lng}`,
        radius: 500,
        type,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    const places = response.data.results.slice(0, 10).map(place => ({
      name: place.name,
      rating: place.rating,
      vicinity: place.vicinity,
      types: place.types,
      photo: place.photos?.[0] ? 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}` 
        : null
    }));

    res.json(places);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get nearby places' });
  }
});

// Geocode address to coordinates
router.get('/geocode', async (req, res) => {
  try {
    const { address } = req.query;

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      return res.status(400).json({ error: 'Address not found' });
    }

    const result = response.data.results[0];
    
    res.json({
      formatted_address: result.formatted_address,
      location: result.geometry.location,
      place_id: result.place_id
    });
  } catch (error) {
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

module.exports = router;