const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const User = require('../models/userModel');
const Tour = require('../models/tourModel');

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // Allow nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // Execute Query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(
        new AppError(
          `${
            // eslint-disable-next-line no-nested-ternary
            Model === Tour ? 'Tour' : Model === User ? 'User' : 'Review'
          } not found`,
          404
        )
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(
        new AppError(
          `${
            // eslint-disable-next-line no-nested-ternary
            Model === Tour ? 'Tour' : Model === User ? 'User' : 'Review'
          } not found`,
          404
        )
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError(
          `${
            // eslint-disable-next-line no-nested-ternary
            Model === Tour ? 'Tour' : Model === User ? 'User' : 'Review'
          } not found`,
          404
        )
      );
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
