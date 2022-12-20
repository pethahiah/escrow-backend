const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
var moment = require('moment');
const auth = require('../authjwt');
const PaymentRoute = express.Router();
const { PrismaClient } = require('@prisma/client');
const Validator = require('validatorjs');
const { settingrule } = require('../rules/companyrules');


const prisma = new PrismaClient();

PaymentRoute.post('/initiate_payment', auth, async (req,res) =>{
    const setting_first = await prisma.setting.findFirst();
    
    const server_url = setting_first.testmode ? 'https://sandbox.paythru.ng/cardfree/transaction/create' : 'https://services.paythru.ng/cardfree/transaction/create';
    
    const Sign = crypto.createHash('sha512').update(req.amount + setting_first.secret_key).digest('hex');
    
    const data = {
        amount: req.amount,
        productId: setting_first.productId,
        transactionReference: req.transactionId,
        paymentDescription: "online payment",
        paymentType: "4",
        displaySummary: true,
        redirectUrl: req.redirect_url,
        Sign: Sign
      }
      const time_unix = moment().unix()
      const Signature = crypto.createHash('sha512').update(time_unix+ setting_first.secret_key).digest('hex');
      
    try{
      const response = await axios.post(server_url, data, {
        headers: {
          'ApplicationId': setting_first.application_id ,
          'Timestamp': time_unix,
          'Signature': Signature,
        }
      });
      const {payLink, message, successful} = response.data;
    console.log(response.data);
    
    return res.status(201).json({success:true, message:"successfully", data: response.data });
  }catch(error) {
    console.log(error);
  }

});

//api/payment/webhook
PaymentRoute.post('/webhook', async (req,res) =>{

  const event = request.body;
  const merchantReference = event.merchantReference
  const transaction = await prisma.transaction.findUnique({
    where: {
      transactionID : merchantReference
    },
    include: {
        order: true,
        witness:true,
        transactionwith:true
    }
});

const total_cost = transaction.order.total_cost

  if ('1' == event.status ) {
    const change_transaction = await prisma.transaction.update({
      where:{
        transactionID:merchantReference
      },
      data:{
        transaction_status:'Paid',
      }
    });

    res.json({received: true});
  }

// Return a response to acknowledge receipt of the event
res.json({received: false});

});
  
module.exports = PaymentRoute;


