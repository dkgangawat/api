const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  taskType: String,
  scheduledAt: Date,
  isExecuted: {
    type: Boolean,
    default: false,
  },
});

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;
