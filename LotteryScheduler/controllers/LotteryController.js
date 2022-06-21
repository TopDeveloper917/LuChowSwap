const config = require('../config')();
const ethers = require('ethers');
const moment = require('moment');
const lotteryABI = require('../config/LuchowSwapLottery');
const provider = new ethers.providers.JsonRpcProvider(config.jsonRPC);
const signer = new ethers.Wallet(config.privateKey, provider);
const lotteryContract = new ethers.Contract(config.lotteryAddress, lotteryABI, signer);

module.exports = {
    name: "LotteryController",
    getEndTime: async function () {
        return moment()
            .add(83, "hours")
            .startOf("hour")
            .utc()
            .unix();
    },
    closeLottery: async function () {
        try {
            // Get network data for running script.
            const [_blockNumber, _lotteryId] = await Promise.all([provider.getBlockNumber(), lotteryContract.currentLotteryId()]);
            // Create, sign and broadcast transaction.
            const tx = await lotteryContract.closeLottery(_lotteryId);
            const message = `[${new Date().toISOString()}] block=${_blockNumber} message='Closed lottery #${_lotteryId}' hash=${tx?.hash}`;
            console.log(message);
        } catch (err) {
            console.log("CloseLotteryError: ", err.message);
        }
    },
    drawNumber: async function () {
        try {
            // Get network data for running script.
            const [_blockNumber, _lotteryId] = await Promise.all([provider.getBlockNumber(), lotteryContract.currentLotteryId()]);
            // Create, sign and broadcast transaction.
            const tx = await lotteryContract.drawFinalNumberAndMakeLotteryClaimable(_lotteryId, true);
            const message = `[${new Date().toISOString()}] block=${_blockNumber} message='Drawed lottery #${_lotteryId}' hash=${tx?.hash}`;
            console.log(message);
        } catch (err) {
            console.log("DrawNumberError: ", err.message);
        }
    },
    startLottery: async function () {
        const that = this;
        try {
            // Get network data for running script.
            const _blockNumber = await provider.getBlockNumber();
            const ticketPrice = config.ticket.price.toString();
            // Create, sign and broadcast transaction.
            const tx = await lotteryContract.startLottery(
                that.getEndTime(),
                ethers.utils.parseUnits(ticketPrice, 'ether'),
                config.ticket.discount,
                config.ticket.rewards,
                config.ticket.treasury
            );
            const message = `[${new Date().toISOString()}] block=${_blockNumber} message='Started lottery' hash=${tx?.hash}`;
            console.log(message);
        } catch (err) {
            console.log("StartLotteryError: ", err.message);
        }
    },
};