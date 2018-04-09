var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var zipdb = require("zippity-do-dah");
var ForecastIo = require("forecastio");

var app = express();
//Darksky Api key
var weather = new ForecastIo("API_KEY");

app.use(express.static(path.resolve(__dirname, "public")));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function (req, res) {
    res.render("index");
});

app.get(/^\/(\d{5})$/, function(req, res, next){
  var zipcode = req.params[0];
  var location = zipdb.zipcode(zipcode);
  if(!location.zipcode){
    next();
    return;
  }

  var latitude = location.latitude;
  var longitude = location.longitude;

  weather.forecast(latitude, longitude, function (err, data) {
      if(err){
        next();
        return;
      }
      res.json({
          zipcode: zipcode,
          temperature: data.currently.temperature
      });
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
