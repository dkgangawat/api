const Task = require("../models/taskSchema");
const { cancelOrderIfPaymentNotCompleted } = require("./cancelOrderIfPaymentNotCompleted");

performPendingTasks = async() =>{
    const pendingTasks = await Task.find({ isExecuted: false, scheduledAt: { $lte: new Date() } });
  
    pendingTasks.forEach(async (task) => {
        await cancelOrderIfPaymentNotCompleted(task.taskType);
      console.log(`Executing pending task with type: ${task.taskType}`);
      task.isExecuted = true;
      await task.save();
    });
  }
  
    module.exports = { performPendingTasks };
  