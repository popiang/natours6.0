const mongoose = require('mongoose');
const { default: slugify } = require('slugify');

const tourSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            maxLength: [
                40,
                'A tour name must be equal of less than 40 characters',
            ],
            minLength: [
                10,
                'A tour name must be equal of more than 10 characters',
            ],
        },
		slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a max group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty level'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty level must be easy, medium or difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be equal of more than 1'],
            max: [5, 'Rating must be equal or less than 5'],
        },
		ratingsQuantity: {
			type: Number,
			default: 0
		},
        price: {
            type: Number,
            required: [true, 'A Tour must have a price'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    return val < this.price;
                },
                message:
                    'Discount price {{PRICE}} must be below the regular price',
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a summary'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have an image cover'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// document middleware
tourSchema.pre('save', function (next) {
	console.log('masuk document middleware');
    this.slug = slugify(this.name, { lower: true });
    next();
});

// query middleware
tourSchema.pre(/^find/, function (next) {
    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    next();
});

// aggregate middleware
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
