const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const checAuth = require('../middleware/check-auth');

const Order = require('../models/order');
const Product = require('../models/product');

const OrdersController = require('../controllers/order');

router.get('/', checAuth,OrdersController.orders_get_all);

router.post('/',checAuth,(req,res,next) => {
    Product.findById(req.params.productId)
    .then(product => {
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        });
        // no exec for save, you need exec to convert to a real promise and in case of save you already get one
        return order.save();
    })
    .then(result => {
        console.log(result);
        res.status(201).json({
            message:"Order stored",
            createdOrder: {
                _id: result._id,
                product: result.product,
                quantity: result.quantity
            },
            request: {
                type: 'GET',
                url: 'http://localhost:8080/products/' + result._id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: "Product not found",
            error: err
        });
    });
 });

 router.get('/:orderId',checAuth,(req,res,next) => {
    Order.findById(req.params.orderId)
    .populate('product') // now only name will get displayed
    .exec()
    .then(order => {
        res.status(201).json({
            id: req.params.orderId,
            product: order.product,
            quantity: order.quantity,
            request: {
                type:'GET',
                description: 'Get all the orders',
                url: 'http://localhost:8080/orders/'
            }
        });
    })
    .catch(err=> {
        res.status(500).json(err);
    });
 });

 router.post('/:orderId',checAuth,(req,res,next) => {
    res.status(201).json({
        id: req.params.orderId,
         message: "Order asd was created"
    });
 });

 router.delete('/:orderId',checAuth,(req,res,next) => {
    const id = req.params.orderId;
    Order.remove({_id: id})
    .exec().then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
 });

module.exports = router;