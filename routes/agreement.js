const express = require("express");


const AgreementRoute = express.Router();
const { transaction_doc } = require('../rules/transactionrule');
const { PrismaClient } = require('@prisma/client');
const { ProcessDocument } = require('../processfile');
const { TransactionwithUser, Transaction } = require("../find");
const auth = require("../authjwt");
const Validator = require('validatorjs');
const prisma = new PrismaClient();

AgreementRoute.post("/create_agreement",auth, async (req,res) => {

    let validation = new Validator(req.body, transaction_doc);
    const status = validation.passes(); 

    if(status == false)
        return res.status(422).json({success: false, errors: { message : validation.errors }});
    
    if(!req.files.document)
        return res.status(400).json({success: false, errors: { message : "KIndly update a Signed Document conatining the details of the transaction" }});

    const transaction = await TransactionwithUser(req);

    if(transaction == null)
        return res.status(404).json({success: false, errors: { message : "Transaction not Found" }});

    const responses = ProcessDocument(req.files.document)  

    if(responses == null)
        return res.status(404).json({success: false, errors: { message : 'Upload a valid File'} });   
        
    const agreement = await prisma.agreement.findFirst({
        where: { 
            AND: [
                { transactionId : parseInt(req.body.transactionId) },
                { uploadedById : req.user.id }
            ]
         }
    });   
    
    if(agreement == null)
    {
        const newagreement = await prisma.agreement.create({
            data: {
                document: responses.filename,
                uploadedBy: {
                    connect: {
                        id : req.user.id
                    }
                },
                transaction : {
                    connect : {
                        id : parseInt(req.body.transactionId)
                    }
                }
            },
            include:{
                uploadedBy:true
            }
        });

        return res.status(201).json({success: true, data : newagreement, message: "Document Uploaded Successfully" }); 

    }else {
        const newagreement = await prisma.agreement.update({
            where: {
                id : agreement.id
            },
            data: {
                document: responses.filename
            },
            include:{
                uploadedBy:true
            }
        });

        return res.status(201).json({success: true, data : newagreement, message: "Document Uploaded Successfully" }); 
    }
    


});

AgreementRoute.get("/get_agreement/:transactionId", auth, async (req,res) => {
  try{
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



    const agreement = await prisma.agreement.findMany({
        where: { transactionId : parseInt(req.params.transactionId)},
        include:{
            uploadedBy: true
        }
    });

    return res.status(201).json({success: true, data : agreement, message: "Document Retrieved Successfully" }); 

  }catch(e)
  {
      console.log(e);
      return res.status(400).json({success: false, errors: { message : "Can not Fetch Documents" }});
 
  }
    
})


module.exports = AgreementRoute;