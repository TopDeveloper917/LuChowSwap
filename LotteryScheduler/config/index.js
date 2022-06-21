const live_config = {
    mode: 'live',
    server_ip: '',
    lotteryAddress: "0xb4796a5aC0CD46e4cA28432c9147780A138f6726",
    generatorAddress: "0x7c88dEA42E72a788FCEeA0D1edD8595B4E0EE75E",
    jsonRPC: "https://bsc-dataseed.binance.org/",
    privateKey: "684053282ea6f788e788469dac3d1e700fff1ace289cdb5315a15718c1a41923",
    privateAddress: "0x387F923E945d125890177e3C8E9985Ba88517e95",
    ticket: {
        price: 1000000,
        precision: 2,
        discount: 2000,
        rewards: [250,375,625,1250,1875,5625],
        treasury: 2000
    }
};

module.exports = function () {
    return live_config;
};