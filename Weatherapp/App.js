require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const API_KEY = process.env.API_KEY;

app.get('/weather', async (req, res) => {
  const city = req.query.city || 'London';

  try {
    const currentWeather = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: city, units: 'metric', appid: API_KEY }
    });

    const weatherData = currentWeather.data;
    const cityName = weatherData.name;
    const currentTemp = weatherData.main.temp;
    const currentCondition = weatherData.weather[0].description;
    const latitude = weatherData.coord.lat;
    const longitude = weatherData.coord.lon;

    const forecastData = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: { lat: latitude, lon: longitude, units: 'metric', appid: API_KEY }
    });

    const dailyForecast = [];
    forecastData.data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      const hour = item.dt_txt.split(' ')[1].split(':')[0];
      if (hour === '12') {
        dailyForecast.push({
          date,
          temp: item.main.temp,
          condition: item.weather[0].description
        });
      }
    });

    res.json({
      city: cityName,
      current: { temp: currentTemp, condition: currentCondition },
      forecast: dailyForecast.slice(0, 5)
    });

  } catch (error) {
    res.status(500).json({ error: 'Could not get weather data.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
