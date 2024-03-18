const bodyParser = require('body-parser');
const morgan = require('morgan');
const express = require('express');
const tourRouter = require('./routes/tourRoutes');
const globalErrorHanler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

app.use(bodyParser.json());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/tours', tourRouter);

app.use('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server`, '404'));
});

app.use(globalErrorHanler);

module.exports = app;
