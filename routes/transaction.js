const express = require('express');
const helper = require('../helper/helper');
const auth =  require('../authjwt');
const { transactionwithrule, transactionupdate, witnessrule }= require('../rules/transactionrule')
const TransactionRoute = express.Router();
const { PrismaClient, Prisma } = require("@prisma/client");
const Validator = require('validatorjs');
const { Transaction,TransactionInfoByGet, UserByEmail, InviteeByEmail, UserAddedToTransaction, UserInvitedToTransaction, WitnessAddedToTransaction, invite_Transaction_Link } = require("../find");
const ProcessMail = require('../Processmail');


const prisma = new PrismaClient(); 

TransactionRoute.post('/create_transaction',auth, helper, async(req, res) =>{
    let id = Math.floor(100000 + Math.random() * 900000)
    const transaction = await prisma.transaction.create({
        data: {
            startedById: req.user.id,
            transactionID: id.toString()
        },
        include: {
            order: true,
            witness:true,
            transactionwith:true,
            startedBy:true,
            transaction_update: true
        }
    });

    res.status(201).json({ success: true, transaction : transaction });
});

TransactionRoute.get('/get_transactions',auth, helper, async(req, res) =>{

    const transactions = await prisma.transaction.findMany({
        where: {
        OR: [
                {
                    startedById: req.user.id,
                },
                {
                    transactionwithId: req.user.id
                },
            ],
        },
        include: {
            order: true,
            witness: true,
            transactionwith:true,
            startedBy:true,
            transaction_update: {
                include: {
                    user:true
                }
            }
        }
    });

    res.status(200).json({ success: true, data : transactions });
});

TransactionRoute.get('/get_transaction/:transactionId',auth, helper, async(req, res) =>{

    try{
        const transaction = await prisma.transaction.findUnique({
            where: {
                id : parseInt(req.params.transactionId)
            },
            include: {
                order: true,
                witness:true,
                transactionwith:true
            }
        });
        res.status(200).json({ sucess: true, transaction : transaction });

    }catch(e)
    {
        throw e;
        res.status(400).json({ success: true, errors : { message : e} });

    }
    

});

TransactionRoute.post("/transactionwith", auth, async (req,res) => {
    let validation = new Validator(req.body, transactionwithrule);
    const status = validation.passes(); 

    if(status == false)
        return res.status(422).json({success: false, errors: { message : validation.errors }});
    
    const transaction = await Transaction(req);

    if(transaction == null)
        return res.status(404).json({success: false, errors: { message : "Transaction not Found" } }); 

    const addedtransactionwith = await UserAddedToTransaction(req); 

    if(addedtransactionwith == false)
       return res.status(400).json({success: false, errors: { message : "User already Added to this Trasaction" } });    

    const user = await UserByEmail(req.body.email);

    await prisma.transaction.update({
        where: { id : req.body.transactionId},
        data:{
            otherparty_category:req.body.otherparty_category
        }
    });

    
        if(user)
        {
            const update = await prisma.transaction.update({
                where: { id : req.body.transactionId},
                data:{
                    transactionwithId: user.id                
                },
                include: {
                    transactionwith: true
                }
            });
            await ProcessMail('Invite To Transaction',req.body.email,null,req.body.name, req.user.firstname);
            return res.status(201).json({success: true, transaction: update.transactionwith, status: 1  }); 

        }else 
        {
            try {
                const invite_exist = await InviteeByEmail(req.body.email);
                if(invite_exist == null)
                {
                    const invite_transaction = await invite_Transaction_Link(req.body.transactionId)

                    if(invite_transaction != null)
                        return res.status(200).json({success: false, errors : { message : "User already invited to Transaction" }  }); 

                    const invite = await prisma.invitee.create({
                        data:{
                            email: req.body.email,
                            name: req.body.name,
                            invitedById: req.user.id,
                            inviteType:'Individual',
                            transaction_link: { 
                            create: {
                                type: 'Transaction',
                                transactionId: req.body.transactionId,
                            } 
                            
                            }
                            
                        }
                    });
                    await ProcessMail('Invite To Transaction',req.body.email,null,req.body.name, req.user.firstname);
                    return res.status(201).json({success: true, invited: invite, status : 2  }); 

                }else {
                    const user_invited_to_transaction = await UserInvitedToTransaction(req)
                    
                    if(user_invited_to_transaction != null)
                        return res.status(200).json({success: false, errors : {message : "You have already Invited a User to this Transaction"} }); 

                    const invite = await prisma.invite_Transaction_Link.create({
                            data: {
                                type: 'Transaction',
                                transactionId: req.body.transactionId,
                                inviteId: invite_exist.id 
                            },
                            include: {
                                invite: true
                            }
                        });
                    
                    await ProcessMail('Invite To Transaction',req.body.email,null,req.body.name, req.user.firstname);
                    return res.status(201).json({success: true, invited: invite, status : 3  }); 
    
                }
                

            }
            catch(e)
            {
                throw e;
                   
            }
        }  
   
        
}); 

TransactionRoute.post("/add_witness", auth, async (req,res) => {
    
    let validation = new Validator(req.body, witnessrule);
    const status = validation.passes(); 

    if(status == false)
        return res.status(422).json({success: false, errors: { message : validation.errors }});
    
    const transaction = await Transaction(req);

    if(transaction == null)
        return res.status(404).json({success: false, errors: { message : "Transaction not Found" } }); 

    const user = await UserByEmail(req.body.email);
   

        if(user)
        {
            const witness_added = await WitnessAddedToTransaction(req, user)

            if(witness_added != null)
                return res.status(400).json({success: false, errors: { message : "User already added" } }); 

            const update = await prisma.witness.create({
                data:{
                    witnessId: user.id,
                    transactionId: req.body.transactionId,
                },
                include:{
                    user:true
                }
            });
            await ProcessMail('Invite To Witness a Transaction',req.body.email,null,req.body.name, req.user.firstname);
            return res.status(201).json({success: true, witness: update, status: 1  }); 

        }else 
        {
            try {
                const invite_exist = await InviteeByEmail(req.body.email);
                if(invite_exist == null)
                {
                    const invite = await prisma.invitee.create({
                        data:{
                            email: req.body.email,
                            name: req.body.name,
                            invitedById: req.user.id,
                            inviteType:'Witness',
                            witness_link: { 
                            create: {
                                type: 'Witness',
                                transactionId: req.body.transactionId,
                            } 
                            
                            }
                            
                        }
                    });
                    await ProcessMail('Invite To Witness a Transaction',req.body.email,null,req.body.name, req.user.firstname);
                    return res.status(201).json({success: true, invited: invite, status : 2  }); 

                }else {
                    const already_added = await WitnessInvitedToTransaction(req,invite_exist.id)
                    
                    if(already_added != null)
                        return res.status(200).json({success: false, errors: { message : "User already Invited"}  }); 

                    const invite = await prisma.invite_Witness_Link.create({
                            data: {
                                type: 'Witness',
                                transactionId: req.body.transactionId,
                                inviteId: invite_exist.id 
                            }
                        });
                    
                    await ProcessMail('Invite To Witness a Transaction',req.body.email,null,req.body.name, req.user.firstname);

                    return res.status(201).json({success: true, invited: invite, status : 2  }); 
    
                }
                

            }
            catch(e)
            {
                throw e;
                   
                // if(e typeof Prisma.PrismaClientknownRequestError)
                // {
               
                // }
            }
        }  
   

});

TransactionRoute.post("/update_transaction",auth, async (req,res) => {
    let validation = new Validator(req.body, transactionupdate);
    const status = validation.passes(); 

    if(status == false)
        return res.status(422).json({success: false, errors: { message : validation.errors }});
    
    const exist = await Transaction(req);

    if(exist == null)
        return res.status(404).json({success: false, errors: { message : "Transaction not Found" }});

    const transaction = await Transaction(req);
    
    if(transaction.transactionwithId != req.user.id)
        return res.status(200).json({success: true, errors: { message : "Access Denied" }});

    const transactionflow = await prisma.transactionFlow.create({
        data: {
            transaction: {
                connect: {
                    id : req.body.transactionId
                }
            },
            stage: req.body.status,
            status: req.body.status,
            date_stage: new Date(),
            user : {
                connect : {
                    id : req.user.id
                }
            }
        }
       
    });

        
        
    return res.status(201).json({success: true, message : "Updated Successfully" }); 
});

TransactionRoute.get("/transactionwith/:transactionId",auth, async (req,res) => {
    try{
        const transaction = await TransactionInfoByGet(req,req.params.transactionId)
        console.log(transaction)
        if(transaction == null)
            return res.status(404).json({ success: false, errors : { message : "Not Found "} });

        if(transaction.transactionwith != null)
            return res.status(200).json({success: true, transaction : transaction, invited : null }); 

        const invite_transaction = await invite_Transaction_Link(parseInt(req.params.transactionId))
        if(invite_transaction != null)
            return res.status(200).json({success: true, transaction : null, invited: invite_transaction.invite }); 


        return res.status(200).json({success: true, transaction : null, invited: null }); 


    }catch(e)
    {
        console.log(e);
        return res.status(200).json({success: false, errors : { message :''} }); 

    }
    
});

TransactionRoute.get("/get_witnesses/:transactionId",auth, async (req,res) => {
    try{
        const transaction = TransactionInfoByGet(req,req.params.transactionId)
        if(transaction == null)
            return res.status(404).json({ success: false, errors : { message : "Not Found "} });

        const witnesses = await prisma.witness.findMany({
            where:{
                transactionId : parseInt(req.params.transactionId)
            },
            include:{
                user:true
            }
        });

        const invited = await prisma.invite_Witness_Link.findMany({
            where: {
                transactionId : parseInt(req.params.transactionId)
            },
            include:{
                invite:true
            }
        });

        return res.status(200).json({ success: true, invited: invited, witnesses : witnesses})

    }catch(e)
    {
        console.log(e);
        return res.status(400).json({success: false, errors : { message :''} }); 

    }
    
});



module.exports = TransactionRoute;