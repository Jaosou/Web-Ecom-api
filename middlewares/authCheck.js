const jwt = require('jsonwebtoken')
const prisma = require('../confix/prisma')

exports.authCheck = async(req, res, next) => {
    try {
        //Check Token
        const headerToken = req.headers.authorization
        if (!headerToken) {
            return res.status(401).json({ message: "No Token authorization!" })
        }
        const token = headerToken.split(" ")[1]

        const decode = jwt.verify(token, process.env.SECRET)

        req.user = decode

        const user = await prisma.user.findFirst({
            where : {
                email : req.user.email
            }
        })
        if(!user.enable){
            return res.status(400).json({message : "Not Connected User"})
        }
        next()
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Token invalid" })
    }
}

exports.adminCheck = async(req,res,next)=>{
    try {
        const {email} = req.user
        const adminEmail = await prisma.user.findFirst({
            where : {
                email : email
            }
        })
        if(!adminEmail || adminEmail.role != 'Admin'){
            return res.status(403).json({message : "Acess denied : Admin Only"})
        }
        // console.log('Admin Check',email)
        next()
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "U not admin" })
    }
}