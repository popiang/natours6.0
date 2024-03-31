const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.getTop5CheapTours = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,-price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

    next();
};

exports.getAllTours = catchAsync(async (req, res) => {
    const apiFeatures = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination();

    // execute query
    const tours = await apiFeatures.query;

    res.status(200).json({
        status: 'Success',
        results: tours.length,
        data: {
            tours,
        },
    });
});

exports.getTourById = catchAsync(async (req, res) => {
    const id = req.params.id;

    const tour = await Tour.findById(id);

    if (!tour) {
        next('Tour ID is not found', 404);
    }

    res.status(200).json({
        status: 'Success',
        data: {
            tour,
        },
    });
});

exports.createATour = catchAsync(async (req, res) => {
    const newTour = await Tour.create(req.body);

    res.status(200).json({
        status: 'Success',
        data: {
            newTour,
        },
    });
});

exports.updateATour = catchAsync(async (req, res) => {
    const id = req.params.id;
    const updatedTour = await Tour.findByIdAndUpdate(id, req.body);

    if (!updatedTour) {
        next('Tour ID is not found', 404);
    }

    res.status(200).json({
        status: 'Success',
        data: {
            updatedTour,
        },
    });
});

exports.deleteATour = catchAsync(async (req, res) => {
    const id = req.params.id;

    const deletedTour = await Tour.findByIdAndDelete(id);

    if (!deletedTour) {
        next('Tour ID is not found', 404);
    }

    res.status(204).json({
        status: 'Success',
        message: 'Tour has been deleted',
    });
});

exports.getTourStats = catchAsync(async (req, res) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { avgPrice: 1 },
        },
    ]);

    res.status(200).json({
        status: 'Success',
        data: {
            stats,
        },
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: {
                month: '$_id',
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
        {
            $sort: { numTourStarts: -1 },
        },
        {
            $limit: 12,
        },
    ]);

    res.status(200).json({
        status: 'Success',
        data: {
            plan,
        },
    });
});
