const { query } = require("express")
const prisma = require("../confix/prisma")
const { v2 } = require('cloudinary');
const cloudinary = v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

exports.createProduct = async (req, res) => {
    try {
        const { title, description, price,
            categoryId, quantity, images } = req.body
        const newProduct = await prisma.product.create({
            data: {
                title: title,
                description: description,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                categoryId: parseInt(categoryId),
                images: {
                    create: images.map((item, index) => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url,
                    }))
                }
            }
        })
        res.send(newProduct)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })
    }
}


exports.listProducts = async (req, res) => {
    try {
        const { count } = req.params
        const products = await prisma.product.findMany({
            take: parseInt(count),
            orderBy: { createdAt: 'desc' },
            include: { // Todo : Join Table
                category: true,
                images: true
            }
        })
        res.send(products)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })
    }
}

exports.readProduct = async (req, res) => {
    try {
        const { id } = req.params
        const product = await prisma.product.findFirst({
            where: {
                id: Number(id)
            },
            include: {
                category: true,
                images: true
            }
        })
        res.send(product)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })
    }
}

exports.updateProduct = async (req, res) => {
    try {
        const { title, description, price,
            category, quantity, images } = req.body

        await prisma.image.deleteMany({
            where: {
                productId: Number(req.params.id)
            }
        })

        const newProduct = await prisma.product.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                title: title,
                description: description,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                categoryId: parseInt(category),
                images: {
                    create: images.map((item, index) => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url,
                    }))
                }
            }
        })
        res.send(newProduct)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })
    }
}

exports.delProduct = async (req, res) => {
    try {
        const { id } = req.params

        //Todo : Step 1 seach target product for delete foreign Key
        const product = await prisma.product.findFirst({
            where: {
                id: Number(id),
            },
            include: {
                images: true
            }
        })
        if (!product) {
            return res.status(400).json({ message: 'Product is empty!!' })
        }
        console.log(product)
        //Todo : Step 2 Delete Images in cloudinary
        const deleteImageOnCloud = product.images.map((image, index) =>
            new Promise((resolve, reject) => {

                //Todo : delete images in cloud
                cloudinary.uploader.destroy(image.public_id, (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                })
            })
        )

        //Todo : wait for delete on cloud
        await Promise.all(deleteImageOnCloud)

        //Todo : Step 3 : Delete product
        await prisma.product.delete({
            where: {
                id: Number(id)
            }
        })
        res.send('Delete Success!!')
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })
    }
}


exports.selectProduct = async (req, res) => {
    try {
        const { sort, order, limit } = req.body
        console.log(sort, order, limit)
        const products = await prisma.product.findMany({
            take: parseInt(limit),
            orderBy: { [sort]: order },
            include: {
                images: true,
                category: true
            }
        })

        res.send(products)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })
    }
}

//Todo : Seach by title
const handleQuery = async (req, res, query) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                title: { contains: query }
            }, include: {
                category: true,
                images: true
            }
        })
        res.send(products)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })
    }
}

//Todo : Seach by Price
const handlePrice = async (req, res, priceRange) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                price: {
                    gte: priceRange[0],
                    lte: priceRange[1]
                }
            },
            include: {
                category: true,
                images: true
            }
        })
        res.send(products)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })
    }
}

const handleCategory = async (req, res, categoryId) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                categoryId: {
                    in: categoryId.map((id) => Number(id))
                }
            }, include: {
                category: true,
                images: true
            }
        })
        res.send(products)
    } catch (err) {
        console.log(err)
        res.send(500).json({ message: "Server error!!" })
    }
}

exports.seachProduct = async (req, res) => {
    try {
        const { query, category, price } = req.body
        if (query) {
            await handleQuery(req, res, query)
        }
        if (category) {
            console.log("category-->", category)
            await handleCategory(req, res, category)
        }
        if (price) {
            console.log("price-->", price)
            await handlePrice(req, res, price)
        }
        // res.send('Hello')
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })
    }
}



exports.createImages = async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.body.image, {
            public_id: `Hello-${Date.now()}`,
            resource_type: 'auto',
            folder: 'Ecom2024'
        })
        res.send(result)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })
    }
}

exports.removeImage = async (req, res) => {
    try {
        const public_id = req.body.public_id
        cloudinary.uploader.destroy(public_id, (result) => {
            res.send("Remove images success!!")
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })
    }
}