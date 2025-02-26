const express = require("express")
const router = express.Router()


const { createProduct, listProducts, readProduct, updateProduct, delProduct, selectProduct, seachProduct, createImages,removeImage} = require('../controllers/products')
const { adminCheck, authCheck } = require('../middlewares/authCheck')


//import controller
router.post('/product', authCheck, adminCheck, createProduct)
router.get('/products/:count', listProducts)
router.get('/product/:id',authCheck,adminCheck, readProduct)
router.put('/product/:id',authCheck,adminCheck, updateProduct)
router.delete('/product/:id', delProduct)
router.post('/productby', selectProduct)
router.post('/seach/filters', seachProduct)

//images
router.post('/images', authCheck, adminCheck, createImages)
router.post('/removeimage', authCheck, adminCheck, removeImage)


module.exports = router