// Create a new router
const express = require("express")
const router = express.Router()
//9
const request = require('request');

//8
const redirectLogin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    // if not logged in, send them to login page
    return res.redirect("/users/login");
  }
  next();
};

///8
// Handle routes
router.get('/',function(req, res, next){
    res.render('index.ejs')
});

router.get('/about',function(req, res, next){
    res.render('about.ejs')
});


// Weather route with user input
//9
router.get('/weather', function (req, res, next) {
  const apiKey = '23672c356ec681bf584d1ca93978d417';

  // If no city provided
  if (!req.query.city) {
    return res.render('weather.ejs', {
      weather: null,
      city: '',
      error: null
    });
  }

  // City typed by the user
  const cityRaw = req.query.city;
  const city = req.sanitize ? req.sanitize(cityRaw) : cityRaw;

  const url = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

  request(url, function (err, response, body) {
    if (err) {
      console.error('Request error:', err);
      return res.render('weather.ejs', {
        weather: null,
        city,
        error: 'Error contacting the weather service. Please try again.'
      });
    }

    let weatherData;

    try {
      weatherData = JSON.parse(body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, body);
      return res.render('weather.ejs', {
        weather: null,
        city,
        error: 'Unexpected response from the weather service.'
      });
    }

    if (weatherData.cod !== 200 && weatherData.cod !== '200') {
      return res.render('weather.ejs', {
        weather: null,
        city,
        error: weatherData.message || 'City not found. Please try another city.'
      });
    }

const description = weatherData.weather[0].description;
const wind = weatherData.wind.speed;
const icon = weatherData.weather[0].icon;

const wmsg = `
  <strong>Weather for ${weatherData.name}</strong><br><br>
  Temperature: ${weatherData.main.temp}°C <br>
  Conditions: ${description} <br>
  Humidity: ${weatherData.main.humidity}% <br>
  Wind speed: ${wind} m/s <br><br>
  <img src="http://openweathermap.org/img/w/${icon}.png" alt="weather icon">
`;

    res.render('weather.ejs', {
      weather: wmsg,
      city: weatherData.name,
      error: null
    });
  });
});


//8
    router.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
        if (err) {
          return res.redirect('./')
        }
        res.send('you are now logged out. <a href='+'./'+'>Home</a>');
        })
    })
//8
// Export the router object so index.js can access it
module.exports = router