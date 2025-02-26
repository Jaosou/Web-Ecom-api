const prisma = require('../confix/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { use } = require('../routes/auth')

exports.register = async (req , res) => {
    try {
        const { email, password } = req.body
        console.log(email, password)

        //Todo : Validate body
        if (!email) {
            return res.status(400).json({ message: 'Email is null' })
        }
        if (!password) {
            return res.status(400).json({ message: 'Password is null' })
        }

        //todo : State 2 Check email in db ready?
        const user = await prisma.user.findFirst({
            where:{
                email: email
            }
        })
        if(user){
            return res.status(400).json({
                message : "Email Already exist!!"
            })
        }

        //todo : Step 3 Hash Password
        const hashPassword = await bcrypt.hash(password,10)
        

        //todo : Step 4 Register
        await prisma.user.create({
            data:{
                email: email,
                password : hashPassword
            }
        })

        res.send('Register Success!!');

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
}

exports.login = async (req, res) => {
    try {
        //code
        const { email , password } = req.body

        //Check email
        const user = await prisma.user.findFirst({
            where : {
                email : email
            }
        })
        if(!user || !user.enable){
            return res.status(400).json({
                message:"User not found!!"
            })
        }
        //Check Password
        const isMatch = await bcrypt.compare(password,user.password)
        if (!isMatch) {
            return res.status(400).json({message : "Password Invalid!!"})
        }
        //Create Payload
        const Payload = {
            id : user.id,
            email : user.email,
            role : user.role
        }
        //Gen Token
        jwt.sign(Payload,process.env.SECRET,{
            expiresIn : '1d' //todo : token run time : 1 Days
        },(err,token)=>{
            if (err) {
                return res.status(500).json({message : "Server Error!!"})
            }
            res.json({Payload,token})
        })
    } catch (err) {
        //!err
        console.log(err)
        res.status(500).json({ message: "Sever Error" })
    }

}

exports.currentUser = async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where : {
                email : req.user.email
            },
            select:{
                id : true,
                email : true,
                name : true,
                role : true
            }
        })
        res.json({ user })
    } catch (err) {
        //!err
        console.log(err)
        res.status(500).json({ message: "Sever Error" })
    }
}