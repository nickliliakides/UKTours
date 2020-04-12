const mongoose = require('mongoose');
const slugify = require('slugify');

// // Needed when embedding Users
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      unique: true,
      trim: true,
      maxlength: [40, 'Name must have maximum 40 characters'],
      minlength: [6, 'Name must have minimum 6 characters']
      // validate: [validator.isAlpha, 'Name must contain only letters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Duration is required']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Group size is required']
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      trim: true,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 5,
      min: [1, 'Rating must be minimum 1'],
      max: [5, 'Rating must be maximum 5'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'Price is required']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // Works only on current doc on new doc creation.
          return val < this.price;
        },
        message: 'Discount price must be smaller than regular price'
      }
    },
    summary: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Description is required']
    },
    imageCover: {
      type: String,
      required: [true, 'A cover image is required']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      dafault: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // // Embedding Users
    // guides: Array
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour'
});

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// Middleware //

tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// // Embedding users in tours
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordCangedAt'
  });
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  // console.log(docs);
  // eslint-disable-next-line no-console
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// Aggregation Middleware //

// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

//////////////////////

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
