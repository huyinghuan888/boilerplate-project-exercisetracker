const { default: mongoose } = require('mongoose');

const { User } = require('./user.model');

const exerciseSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: User }
  },
  {
    timestamps: {
      createdAt: 'date',
      updatedAt: false
    }
  }
);
const Exercise = mongoose.model('Exercise', exerciseSchema);

/**
 * 创建新运动
 */
function createExercise(exerciseDto, result) {
  const exercise = new Exercise(exerciseDto);

  exercise.save((error, data) => {
    if (error) return result(error.message);
    result(null, data);
  });
}

exports.Exercise = Exercise;
exports.createExercise = createExercise;
