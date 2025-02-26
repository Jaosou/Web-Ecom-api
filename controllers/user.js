const prisma = require("../confix/prisma")

exports.allUser = async (req, res) => {
    try {
        const user = await prisma.user.findMany({})
        res.send(user)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error!!" })
    }
}

exports.changeStateUser = async (req, res) => {
    try {
        const { id, enable } = req.body
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: {
                enable: enable
            }
        })
        res.send("Update enable success!!")
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error!!" })
    }
}

exports.changeRoleUser = async (req, res) => {
    try {
        const { id, role } = req.body
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: {
                role: role
            }
        })
        res.send("Update role success!!")
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error!!" })
    }
}

exports.addCart = async (req, res) => {
    try {
        const { cart } = req.body

        console.log(cart)
        console.log(req.user.id)

        const user = await prisma.user.findFirst({
            where: {
                id: Number(req.user.id)
            }
        })
        
        //TOdo : Check Quantity
        for (const item of cart) {
            const aproduct = await prisma.product.findUnique({
                where: {
                    id: item.id
                }, select: {
                    quantity: true,
                    title: true
                }
            })
            /* console.log(item)
            console.log(aproduct) */

            if (!aproduct || item.count > aproduct.quantity) {
                return res.status(400).json({
                    Ok: false,
                    message: `Sorry. My store dont have count ${aproduct?.title || 'Product off'}`
                })
            }
        }

        /* console.log(user) */

        //Todo : Delete old cart item
        await prisma.productOnCart.deleteMany({
            where: {
                cart: { orderById: user.id }
            }
        })

        //Todo : Delete old cart
        await prisma.cart.deleteMany({
            where: {
                orderById: user.id
            }
        })

        //todo : เตรียมสินค้า
        let product = cart.map((item) => ({
            productId: item.id,
            count: item.count,
            price: item.price
        }))

        //Todo : Sum cart
        let cartTotal = product.reduce((sum, item) => sum + item.price * item.count, 0)

        //Todo : New Cart
        const newCart = await prisma.cart.create({
            data: {
                products: {
                    create: product
                },
                cartotal: parseFloat(cartTotal),
                orderById: user.id
            }
        })

        console.log(newCart)
        res.send("hello Add Cart")
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error!!" })
    }
}

exports.listCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findFirst({
            where: { orderById: Number(req.user.id) },
            include: {
                products: { include: { product: true } }
            }
        })
        res.json(
            {
                products: cart.products,
                cartTotal: cart.cartotal,

            }
        )
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error!!" })
    }
}

exports.delCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findFirst({
            where: { orderById: Number(req.user.id) }
        })

        if (!cart) {
            return res.status(400).json({ message: "No cart" })
        }

        await prisma.productOnCart.deleteMany({
            where: { cartId: cart.id }
        })

        const result = await prisma.cart.deleteMany({
            where: { orderById: Number(req.user.id) }
        })

        console.log(result)

        res.json({
            message: 'Cart Empty',
            deleteCount: result.count
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error!!" })
    }
}

exports.addAddressUser = async (req, res) => {
    try {
        const { address } = req.body
        await prisma.user.update({
            where: {
                id: Number(req.user.id)
            },
            data: {
                address: address
            }
        })
        res.send("Update success!!")
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error!!" })
    }
}
//Todo : save order
exports.placeOnOrder = async (req, res) => {
    try {

        const { id, amount, status, currency } = req.body.paymentIntent;
        console.log(req.body)
        const userCart = await prisma.cart.findFirst({
            where: {
                orderById: Number(req.user.id)
            }, include: {
                products: true
            }
        })

        //Todo : Check Empty
        if (!userCart || userCart.products.length == 0) {
            return res.status(400).json({ ok: false, message: "Cart is empty.!!" })
        }

        //Todo : Create Order
        const order = await prisma.order.create({
            data: {
                products: {
                    create: userCart.products.map((item) => ({
                        productID: item.productId,
                        count: item.count,
                        price: item.price,
                    }))
                },
                orderBy: {
                    connect: { id: Number(req.user.id) }
                },
                cartotal: userCart.cartotal,
                stripePaymentId: id,
                amount: Number(amount),
                status: status,
                currency: currency,
            }
        })
        // stripePaymentId String
        // amount          Int
        // status          String
        // currency        String

        //Todo : Update product
        const updateProduct = userCart.products.map((item) => ({
            where: {
                id: item.productId
            },
            data: {
                quantity: { decrement: item.count },
                sold: { increment: item.count }
            }
        }))

        //Todo : wait for update data
        await Promise.all(
            updateProduct.map((updated) => prisma.product.update(updated))
        )

        await prisma.cart.deleteMany({
            where: { orderById: Number(req.user.id) }
        })

        console.log(updateProduct)
        res.json({ ok: true, order })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error!!" })
    }
}

exports.getAllOrder = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { orderById: Number(req.user.id) },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        })

        if (orders.length == 0) {
            return res.status(400).json({ Ok: false, message: "No Orders" })
        }

        console.log(orders)
        res.json(orders)


    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error!!" })
    }
}


