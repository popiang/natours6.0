const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/getTourStats').get(tourController.getTourStats);
router.route('/get-monthly-plan/:year').get(tourController.getMonthlyPlan);

router
    .route('/top5cheap')
    .get(tourController.getTop5CheapTours, tourController.getAllTours);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.createATour);
router
    .route('/:id')
    .get(tourController.getTourById)
    .patch(tourController.updateATour)
    .delete(authController.protect, authController.restrictTo('admin'), tourController.deleteATour);

module.exports = router;
