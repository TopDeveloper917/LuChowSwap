let express = require('express');
const compression = require('compression');
let cors = require('cors');

let app = express();
app.use(compression());
app.use(cors());

let bsc_routes = require('./routes/bsc_routes');
let eth_routes = require('./routes/eth_routes');
let polygon_routes = require('./routes/polygon_routes');

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-type,Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use('/bsc/api/v1', bsc_routes);
app.use('/eth/api/v1', eth_routes);
app.use('/polygon/api/v1', polygon_routes);

app.get('*', function (req, res, next) {
    res.send("All Error");
});
app.get('/404', function (req, res, next) {
    res.send("404 Error");
});

const port = 1900;
app.listen(port, async function() {
    console.log( '[' + new Date().toLocaleString() + '] ' +'Server listening http://127.0.0.1:' + port);
});