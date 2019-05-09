const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/First', {useNewUrlParser: true});
// acts as a middle ware
app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req,res,next)=> {
    res.header('Access-Control-Allow-Origin','*'); // access to any origin(client)
    res.header('Access-Control-Allow-Headers','*');
    if(req.method === 'OPTIONS'){
        req.header('Access-Control-Allow-Methods','PUT,POST,GET,DELETE,PATCH')
        return res.status(200).json({});
    }
    next();
});

const productRoutes = require('./api/routes/products')
// Middle Ware

app.use('/products', productRoutes);
const orderRoutes = require('./api/routes/orders')
app.use('/orders', orderRoutes);

const userRoutes = require('./api/routes/user')
app.use('/user', userRoutes);

// Because if you reached this line then no router was able to handle the link
app.use((req,res,next) => {
    const error= new Error('Not found');
    error.status = 404;
    next(error);
});
app.use((error, req,res,next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

// app.use((req, res, next) => {
//     res.status(200).json({
//         message: "It works"
//     });
// });

module.exports = app;