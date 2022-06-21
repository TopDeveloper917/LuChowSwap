const cron = require('node-cron');
const lottery = require('./controllers/LotteryController');
console.log("Server Start ...", new Date());
 // Close lottery
cron.schedule("0 0 * * sun", async () => {
    console.log("CloseLottery: ", new Date());
    await lottery.closeLottery();
}, {});
// Draw lottery
cron.schedule("5 0 * * sun", async () => {
    console.log("DrawNumber: ", new Date());
    await lottery.drawNumber();
}, {});
// Start lottery
cron.schedule("7 0 * * sun", async () => {
    console.log("StartLottery: ", new Date());
    await lottery.startLottery();
}, {});

// Close lottery
cron.schedule("0 12 * * wed", async () => {
    console.log("CloseLottery: ", new Date());
    await lottery.closeLottery();
}, {});
// Draw lottery
cron.schedule("5 12 * * wed", async () => {
    console.log("DrawNumber: ", new Date());
    await lottery.drawNumber();
}, {});
// Start lottery
cron.schedule("7 12 * * wed", async () => {
    console.log("StartLottery: ", new Date());
    await lottery.startLottery();
}, {});