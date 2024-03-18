const AppError = require("../utils/appError");

const handleCastErrorDB = error => {
	const message = `Invalid ${error.path}: ${error.value}`;
	return new AppError(message, 404);
}

const handleDuplicateFieldsDB = error => {
	const value = Object.values(error.keyValue[0]);
	const message = `Duplicate field: ${value}. Please use another value`;
	return new AppError(message, 400);
}

const handleValidationErrorDB = error => {
	const errors = Object.values(error.errors).map(el => el.message);
	const message = `Invalid input data: ${errors.join(', ')}`;
	return new AppError(message, 400);
}

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        res.status(500).json({
            status: 'Error',
            message: 'Something went wrong',
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || '500';
    err.status = err.status || 'Error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    }

    if (process.env.NODE_ENV === 'production') {

		let error = {...err};

		if (error.name === 'CastError') {
			error = handleCastErrorDB(error);
		}

		if (error.code === 11000) {
			error = handleDuplicateFieldsDB(error);
		}

		if (error.name === 'ValidationError') {
			error = handleValidationErrorDB(error);
		}

        sendErrorProd(err, res);
    }
};
