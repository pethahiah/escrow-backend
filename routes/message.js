const express = require('express');

const MessageRoute = express.Router();
const auth = require('../authjwt');
const { PrismaClient } = require("@prisma/client");
const { TransactionwithUser } = require('../find');
const Validator = require('validatorjs');
const prisma = new PrismaClient();
const { messagerule } = require('../rules/messagerule');
const ProcessMail = require('../Processmail');


MessageRoute.post("/send", auth, async (req, res) => {

    let validation = new Validator(req.body, messagerule);
    const status = validation.passes(); 

    if(status == false)
        return res.status(422).json({success: false, errors: { message : validation.errors }});
    
    const transaction = await prisma.transaction.findFirst({
        where: {
            AND:[
                { id : parseInt(req.body.transactionId) },
            ],
            OR: [
                { startedById : req.user.id},
                { transactionwithId : req.user.id}
            ]
        },
        include:{
            startedBy:true,
            transactionwith:true
        }
    })    

    if(transaction == null)
        res.status(404).json({success: false, errors : { message : "Transaction not Found"}})
    
    const message = await prisma.message.create({
        data: {
            message : req.body.message,
            transaction : {
                connect:{
                    id : req.body.transactionId
                }
               
            },
            sendBy: {
                connect: {
                    id : req.user.id
                }
            },
            
        },
        include: {
            sendBy:true
        }
    });

    if(transaction.startedById == req.user.id && transaction.transactionwith != null)
        ProcessMail('Transaction Message',transaction.transactionwith.email,null,transaction.transactionwith.firstname);
    else 
        ProcessMail('Transaction Message',transaction.startedBy.email,null,transaction.startedBy.firstname);

    res.status(201).json({success: true, data : message, message : "Message Sent"})

});

MessageRoute.get('/get/:transactionId', auth, async (req, res) => {
    try
    {
        const transaction = await prisma.transaction.findFirst({
            where: { 
                AND:[
                    { id : parseInt(req.params.transactionId) }
                    ],
                OR: [
                    { startedById : req.user.id},
                    { transactionwithId : req.user.id}
                ]
             }
        });

        if(transaction == null)
            return res.status(403).json({success: false, errors : { message: "Access Denied" } }); 


        const message = await prisma.message.findMany({
            where: {
                 transactionId : parseInt(req.params.transactionId)
            },
            include : {
                sendBy:true
            }
        });

        res.status(200).json({success: true, data : message })

    }catch(e)
    {
        console.log(e);
        res.status(400).json({success: false, errors : { message : "Message Sent"} })

    }
    


});

module.exports = MessageRoute;