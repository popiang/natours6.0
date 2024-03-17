const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

exports.getTop5CheapTours = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,-price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

    next();
};

exports.getAllTours = async (req, res) => {
    try {
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
    } catch (error) {
        res.status('404').json({
            status: 'Fail',
            message: error,
        });
    }
};

exports.getTourById = async (req, res) => {
    try {
        const id = req.params.id;

        const tour = await Tour.findById(id);

        res.status(200).json({
            status: 'Success',
            data: {
                tour,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'Fail',
            message: error,
        });
    }
};

exports.createATour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body);

        res.status(200).json({
            status: 'Success',
            data: {
                newTour,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            message: error,
        });
    }
};

exports.updateATour = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedTour = await Tour.findByIdAndUpdate(id, req.body);

        res.status(200).json({
            status: 'Success',
            data: {
                updatedTour,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            message: error,
        });
    }
};

exports.deleteATour = async (req, res) => {
    try {
        const id = req.params.id;

        const deletedTour = await Tour.findByIdAndDelete(id);

        res.status(204).json({
            status: 'Success',
            message: 'Tour has been deleted',
        });
    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            message: error,
        });
    }
};

exports.getTourStats = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            message: error,
        });
    }
};

exports.getMonthlyPlan = async (req, res) => {
	try {
		const year = req.params.year * 1;

		const plan = await Tour.aggregate([
			{
				$unwind: '$startDates'
			}, 
			{
				$match: {
					startDates: {
						$gte: new Date(`${year}-01-01`),
						$lte: new Date(`${year}-12-31`)
					}
				}
			},
			{
				$group: {
					_id: {$month: '$startDates'},
					numTourStarts: {$sum: 1},
					tours: {$push: '$name'}

				}
			},
			{
				$addFields: {
					month: '$_id'
				}
			},
			{
				$project: {
					_id: 0
				}
			},
			{
				$sort: {numTourStarts: -1}
			},
			{
				$limit: 12
			}
		])

		res.status(200).json({
			status: 'Success',
			data: {
				plan
			}
		})
	} catch (error) {
		res.status(400).json({
			status: 'Fail',
			message: error
		})
	}
}
