const cron = require('node-cron');
const Task = require('../models/taskSchema');
const { cancelOrderIfPaymentNotCompleted } = require('./cancelOrderIfPaymentNotCompleted');


const cronJobToCanclePayment = async (orderID) => {
const scheduledDate = new Date(Date.now() + 8 * 60 * 60 * 1000); 
const task = new Task({
  taskType: orderID,
  scheduledAt: scheduledDate,
});
task.save();
}

const startPaymentCancleCornJob = () => {
    cron.schedule('* * * * *', async () => {
  const pendingTasks = await Task.find({ isExecuted: false, scheduledAt: { $lte: new Date() } });

  pendingTasks.forEach(async (task) => {
    await cancelOrderIfPaymentNotCompleted(task.taskType);
    console.log(`Executing task with type: ${task.taskType}`);

    task.isExecuted = true;
    await task.save();
  });
});
}

module.exports = {cronJobToCanclePayment,startPaymentCancleCornJob};