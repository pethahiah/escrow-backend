const express = require('express');

const WitnessViewRoute = express.Router();
const auth = require('../authjwt');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Validator = require('validatorjs');
const { messagerule } = require('../rules/messagerule');
const ProcessMail = require('../Processmail');

WitnessViewRoute.get("/invitedtransactions", auth, async (req, res) => {

    const witnesses = await prisma.witness.findMany({
        where: {
            witnessId : req.user.id 
        },
        include: {
            transaction : {
                include : {
                    transactionwith: true,
                    startedBy: true,
                    order: true,
                    transaction_agreement: {
                        include : {
                            uploadedBy: true
                        }
                    },
                    transaction_message:{
                        include: {
                            sendBy: true
                        }
                    },
                    transaction_update:true
                }
            }
        }
    })

    res.status(200).json({success: true, data : witnesses })

});

WitnessViewRoute.post("/send", auth, async (req, res) => {

    let validation = new Validator(req.body, messagerule);
    const status = validation.passes(); 

    if(status == false)
        return res.status(422).json({success: false, errors: { message : validation.errors }});
    
    const transaction = await prisma.witness.findFirst({
        where: {
            AND:[
                { transactionId : parseInt(req.body.transactionId) },
                { witnessId : req.user.id},
            ]
        },
        include:{
            transaction:{
                include: {
                    transactionwith:true,
                    startedBy:true
                }
            }
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

    if(transaction.transaction.startedById == req.user.id && transaction.transaction.transactionwith != null)
        ProcessMail('Transaction Message',transaction.transaction.transactionwith.email,null,transaction.transaction.transactionwith.firstname);
    else 
        ProcessMail('Transaction Message',transaction.transaction.startedBy.email,null,transaction.transaction.startedBy.firstname);

    res.status(201).json({success: true, data : message, message : "Message Sent"})

});

WitnessViewRoute.get('/get_message/:transactionId', auth, async (req, res) => {
    try
    {
        const transaction = await prisma.witness.findFirst({
            where: { 
                AND:[
                    {transactionId : parseInt(req.params.transactionId)},
                    { witnessId : req.user.id }
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


module.exports = WitnessViewRoute;