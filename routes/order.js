const express = require("express");
const auth = require("../authjwt");
const helper = require("../helper/helper");
const OrderRoute = express.Router();
const Validator = require('validatorjs');
const { orderrules, editorderrules } = require('../rules/orderrules');
const { PrismaClient, Prisma } = require("@prisma/client");
const _ = require('lodash');
const { Witness, User, Invitee, InviteeByEmail, Order, MyWitnessOnOrder, Transaction } = require("../find");

const prisma = new PrismaClient();

OrderRoute.post("/create_order", auth, async (req,res) => {
    let validation = new Validator(req.body, orderrules);
    const status = validation.passes(); 

    if(status == false)
        return res.status(422).json({success: false, errors: { message : validation.errors }});
    
    const transaction = await prisma.transaction.findUnique({
        where: {
            id : req.body.transactionId
        }
    });

    if(transaction == null)
        return res.status(404).json({ success: false, errors : {message: "Transaction not Found"}});
        
    try {
        const neworder = await prisma.order.create({
            data: {
                name: req.body.name,
                quantity:req.body.quantity,
                unit_cost:req.body.unit_cost,
                total_cost:req.body.total_cost,
                order_description:req.body.order_description,
                other_information:req.body.other_information,
                mode_of_delivery:req.body.mode_of_delivery,
                date_of_delivery: new Date(req.body.date_of_delivery),
                transactionId: req.body.transactionId,
                orderId: Math.floor(100000 + Math.random() * 900000)

            }
            
        }); 
        return res.status(201).json({success: true, order: neworder  }); 
    }catch(e)
    {
        return res.status(400).json({success: false, errors: { message: e } }); 

    }
    

});

OrderRoute.put("/edit_order", auth, async (req,res) => {
    let validation = new Validator(req.body, editorderrules);
    const status = validation.passes(); 

    if(status == false)
        return res.status(422).json({success: false, errors: { message : validation.errors }});
    
    const order = await prisma.order.findUnique({
        where: {
            id : req.body.orderId
        }
    });

    if(order == null)
        return res.status(404).json({ success: false, errors : {message: "Order not Found"}});
        
    try {
        const neworder = await prisma.order.update({
            where: {
                id : req.body.orderId
            },
            data: {
                name: req.body.name,
                quantity:req.body.quantity,
                unit_cost:req.body.unit_cost,
                total_cost:req.body.total_cost,
                order_description:req.body.order_description,
                other_information:req.body.other_information,
                mode_of_delivery:req.body.mode_of_delivery,
                date_of_delivery: new Date(req.body.date_of_delivery),
            }
            
        }); 
        return res.status(201).json({success: true, order: neworder  }); 
    }catch(e)
    {
        return res.status(400).json({success: false, errors: { message: e } }); 

    }
    

});

OrderRoute.delete("/delete_order/:orderId", auth, async (req,res) => {

    try{
        const order = await prisma.order.findUnique({
            where : { id : parseInt(req.params.orderId) }
        });
        
        if(order == null)
            return res.status(404).json({success: false, errors: { message : "Order not Found" }});

        const transaction = await prisma.transaction.findUnique({
            where: {id : order.transactionId}
        });
   
        if(transaction.startedById != req.user.id)
            return res.status(404).json({success: false, errors: { message : "Access Denied" }});

        const flow = await prisma.transactionFlow.findFirst({
            where: {
                AND : [
                    { transactionId : transaction.id },
                    { stage : "Approved" }
                ]
            }
        });
        
        if(flow != null)
            return res.status(400).json({success: false, errors: { message : "Access Denied. Transaction has been Approved" }});

        await prisma.order.delete({
            where: { id : parseInt(req.params.orderId) }
        });

        return res.status(200).json({
             success: true
        });

    }catch(e) {
        console.log(e)
        return res.status(400).json({
            success: false
        });
    }
    
});




module.exports = OrderRoute;