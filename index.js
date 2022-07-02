//es 6
'use strict';
// for env key
import dotenv from 'dotenv'

dotenv.config()
import express from 'express';
import {engine} from 'express-handlebars';
import request from 'request';
import bodyParser from 'body-parser';
import async from 'async';

const PORT = process.env.PORT || 8080;
const app = express();
// place api key in .env file
const API_KEY = process.env.API_KEY;
//body-parser middleware
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(bodyParser.urlencoded({extended: false}));
// to get to img folder
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.render('welcome', {});
});
app.post('/', (req, res) => {
    var stock = null;
    var quote = null;

    async.parallel({
            one: function (callback) {
                const url = 'https://cloud.iexapis.com/stable/stock/' + req.body.stock_ticker + '/company?token=' + API_KEY;
                request(url, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        callback(null, body);
                    } else {
                        callback(true, {});
                    }
                });
            },
            two: function (callback) {
                const url = 'https://cloud.iexapis.com/stable/stock/' + req.body.stock_ticker + '/quote?token=' + API_KEY;
                console.log('Calling get company stock quote details API: ' + url);
                request(url,
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            console.log("Get Company Stock Quote API (two) call SUCCESS");
                            callback(null, body);
                        } else {
                            // setting error as true
                            console.log("Get Company Stock Quote API (two) call FAILED");
                            callback(true, {});
                        }
                    });
            },
        },
        function (err, results) {
            if (err) {
                console.log("Error occured while calling APIs: " + err);
                renderErrorPage();
                return;
            }
            stock = results.one;
            quote = results.two;

            renderPage();
        }
    );

    function renderErrorPage() {
        res.render('notfound');
        return;
    }

    function renderPage() {
        var stockDetails = JSON.parse(stock);
        const quoteDetails = JSON.parse(quote);
        res.render('home', {
            stock: stockDetails,
            quote: quoteDetails,
        });
        return;
    }

});
// about page
app.get('/about', (req, res) => {
    res.render('about');
});

//server start message
app.listen(PORT, () => console.log("Server started....."))
//debug
/*
Handlebars.logger.level = 0; // for DEBUG*/
