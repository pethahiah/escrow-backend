const express = require('express');

const PrivateRoute = express.Router();
const auth = require('../authjwt');
const { PrismaClient } = require("@prisma/client");
const Validator = require('validatorjs');
const prisma = new PrismaClient();
const { bank } = require('../rules/bankrule');


PrivateRoute.post('/create', auth, async (req, res) => {

    let validation = new Validator(req.body, bank);
    const status = validation.passes(); 

    if(status == false)
        return res.status(422).json({success: false, errors: { message : validation.errors }});
    
    const bank = await prisma.bankInformation.create({
        data: {
            bank_name : req.body.bank_name,
            account_number: req.body.account_number,
            account_name: req.body.account_name,
            owner: {
                connect: {
                    id : req.user.id
                }
            }
        }
    });

    res.status(201).json({success: true })

});

PrivateRoute.get('/get', auth, async (req, res) => {
    try
    {
        const message = await prisma.bankInformation.findMany({
            where: {
                 transactionId : parseInt(req.params.transactionId)
            }
        });

        res.status(201).json({success: true, message : message })

    }catch(e)
    {
        res.status(400).json({success: false, errors : { message : e} })

    }
    


});

module.exports = PrivateRoute;