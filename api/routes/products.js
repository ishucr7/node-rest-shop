const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, './uploads')
    },
    filename: function(req, file, cb){
        cb(null,new Date().toISOString() + file.originalname);
    }
});
const fileFilter = (req,file,cb) => {
    // reject a file
    if(file.mimetype === 'image/jpeg' || file.mimetype == 'image/png')
    {
        cb(null,false);
    }
    else{
        cb(null,true);
    }
}
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1034*1024*5,
        }
});

const Product = require('../models/product');
router.get('/', (req,res,next) => {
    Product.find()
    .select('name price _id productImage')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs.map(doc => {
                return {
                    name: doc.name,
                    price: doc.price,
                    productImage: doc.productImage,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:8080/products/' + doc._id
                    }
                }
            }) 
        };
        console.log(docs);
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })

    // res.status(200).json({
    //     message: "handling get requests to /products"
    // });
});

router.post('/', checkAuth,upload.single('productImage'),(req,res,next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    // will store it in the database.
    product
        .save()
        .then(result => {
        console.log(result);
        res.status(200).json({
            message: "Created Product Successfully",
            createdProduct: {
                name: result.name,
                price: result.price,
                id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:8080/products/' + result._id
                }
            }
        });
    
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});
router.get('/:productId', (req, res, next) => {
    const id=req.params.productId;
    Product.findById(id)
    .select('name price')
    .exec()
    .then(doc => {
        console.log("From Database", doc);
        if(doc){
            res.status(200).json({
                doc: doc,
                request: {
                    type: 'GET',
                    description: 'Get the list of all the products',
                    url: 'http://localhost:8080/products/'
                }
            });
        }
        else{
            res.status(404).json({message: 'Not found'});
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});
// The system doesn't have nodemon installed but we just did it for the
// app, so inorder to run it here, we'll add a start script and a command in it inside package.json
// And for starting the server we'll type npm start and the server will automatically run.
// from now on whenver we save a file the server is restarted automatically.
router.patch('/:productId', checkAuth,(req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for(const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id:id}, {$set: updateOps})
    .exec()
    .then(result => {
        res.status(200).json({
            result: result,
            request: {
                type: 'GET',
                description: 'Get the details of the updated product',
                url: 'http://localhost:8080/products/' + id
            }
        });
        console.log(res);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.delete('/:productId', checkAuth,(req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id: id})
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