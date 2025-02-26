const prisma = require("../confix/prisma")
const stripe = require('stripe')('sk_test_51QpYL9FkflQSIIOKRJIFIA43Plb3ya9d5FZmFxTK6wNjyAX7CVkP9BFFnWjJhUJFInLHG0z07kURzpBTtgxYKqTr00EIsUDm2f');

exports.payment = async (req, res) => {
    try {
        //code
        
        const cart = await prisma.cart.findFirst({
            where : {
                orderById : req.user.id
            }
        })
        const amountTHB = cart.cartotal * 100
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountTHB,
            currency: "thb",
            // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
            automatic_payment_methods: {
                enabled: true,
            },
        });
        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })

    }
}