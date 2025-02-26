const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const { readdirSync } = require('fs') //todo : read directery in route


const app = express()

//Todo : MiddleWare
app.use(morgan('dev'))
app.use(express.json({limit : '20mb'}))
app.use(cors())

console.log(readdirSync('./routes'))
readdirSync('./routes')
    .map(
        (item) => app.use('/api', require('./routes/' + item)))

// const authRouter = require('./routes/auth')
// const storeRouter = require('./routes/store')


// app.use('/api',authRouter)
// app.use('/api',storeRouter)

//TODO : Build Router
// app.post('/api', (req, res) => {
//     //     // Get require to User
//     const { email, password } = req.body
//     console.log(email, password)
//     res.send("Jaosou")
// })

app.listen(5001,
    () => console.log('Sever is running on 5001'))
