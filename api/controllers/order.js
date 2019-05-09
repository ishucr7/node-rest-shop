const Order = require('../models/order');
exports.orders_get_all = (req,res,next) => {
    Order.find()
    .select('product quantity _id')
    .populate('product', 'name') // now only name will get displayed
    .exec()
    .then(docs => {
        console.log(docs);
        res.status(200).json({
            count: docs.length,
            orders: docs.map(doc => {
                return {
                    _id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:8080/products/' + doc._id
                    }
                }
            })
    });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
//    res.status(200).json({
//         message: "fetched all the orders"
//    });
};