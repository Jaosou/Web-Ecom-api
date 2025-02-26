const express = require("express")
const router = express.Router()

//todo : Middle Wares
const { authCheck, adminCheck } = require('../middlewares/authCheck')

const {allUser,changeStateUser,changeRoleUser
    ,addCart,listCart,delCart,addAddressUser
    ,placeOnOrder,getAllOrder} = require('../controllers/user')

router.get('/users',authCheck,adminCheck,allUser)

router.post('/change-status',authCheck,adminCheck,changeStateUser)
router.post('/change-role',authCheck,adminCheck,changeRoleUser)

router.post('/user/cart',authCheck,addCart)
router.get('/user/cart',authCheck,listCart)
router.delete('/user/cart',authCheck,delCart)

router.post('/user/address',authCheck,addAddressUser)

router.post('/user/order',authCheck,placeOnOrder)
router.get('/user/order',authCheck,getAllOrder)

module.exports = router