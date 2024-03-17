const bodyParser = require('body-parser');
const morgan = require('morgan');
const express = require('express');
const tourRouter = require('./routes/tourRoutes');

const app = express();

app.use(bodyParser.json());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/tours', tourRouter);

module.exports = app;
