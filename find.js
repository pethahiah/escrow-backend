const { PrismaClient } = require('@prisma/client');


const prisma = new PrismaClient();

exports.Witness = async (id) => {
    const witness = await prisma.witness.findUnique({
        where: { id : id}
    });

    prisma.$disconnect();
    return witness;
   
}

exports.Invitee = async (id) => {
    const invitee = await prisma.invitee.findUnique({
        where: {id : id }
    });

    prisma.$disconnect();
    return invitee;
    
}

exports.InviteeByEmail = async (email) => {
    const invitee = await prisma.invitee.findUnique({
        where: {email : email }
    });

    prisma.$disconnect();
    return invitee;
    
}

exports.User = async (id) => {
    const user = await prisma.user.findUnique({
        where: {id : id }
    });
    prisma.$disconnect();
    return user;
    
}

exports.Order = async (id) => {
    const order = await prisma.order.findUnique({
        where: {id : id }
    });
    prisma.$disconnect();
    return order;
    
}

exports.UserByEmail = async (email) => {
    const user = await prisma.user.findUnique({
        where: {email : email }
    });
    prisma.$disconnect();
    return user;
    
}

exports.MyWitnessOnOrder = async (req) => {
    const witness = await prisma.witness.findUnique({
        where: {orderId : req.params.orderId, inviteById : req.user.id }
    });
    prisma.$disconnect();
    return witness;
    
}

exports.Transaction = async (req) => {
    const transaction = await prisma.transaction.findUnique({
        where: { id : req.body.transactionId }
    });
    prisma.$disconnect();
    return transaction;
    
}

exports.UserAddedToTransaction = async (req) => {
    const transaction = await prisma.transaction.findUnique({
        where: { id : req.body.transactionId }
    });
    prisma.$disconnect();
    if(transaction.transactionwithId == null)
        return true;
    return false;    
    
}

exports.UserInvitedToTransaction = async (req) => {
    const transaction = await prisma.invite_Transaction_Link.findFirst({
        where: { transactionId : req.body.transactionId }
    });
    prisma.$disconnect();
    return transaction;   
    
}

exports.WitnessInvitedToTransaction = async (req, inviteId) => {
    const invite = await prisma.invite_Witness_Link.findFirst({
        where: { 
            AND: [
                { transactionId : req.body.transactionId},
                { inviteId : inviteId }
            ]
         }
    });
    prisma.$disconnect();
    return invite;   
    
}

exports.WitnessAddedToTransaction = async (req, user) => {
    const witness = await prisma.witness.findFirst({
        where: { 
            AND: [
                { transactionId : req.body.transactionId},
                { witnessId : user.id }
            ]
         }
    });
    prisma.$disconnect();
    return witness;   
    
}

exports.TransactionwithUser = async (req) => {

    if(parseInt(req.body.transactionId) == NaN)
        return null;

    const transaction = await prisma.transaction.findFirst({
        where: { 
            AND:[
                { id : parseInt(req.body.transactionId) }
                ],
            OR: [
                { startedById : req.user.id},
                { transactionwithId : req.user.id}
            ]
         },
         include: {
             startedBy:true,
             transactionwith:true
         }
    });
    prisma.$disconnect();
    return transaction;   
    
}

exports.invite_Transaction_Link = async (transactionId) => {
    const transaction = await prisma.invite_Transaction_Link.findFirst({
        where: { transactionId : transactionId},
        include:{
            invite : true
        }
    });

    return transaction;
}

exports.TransactionInfoByGet = async (req,transactionId) => {

    if(parseInt(transactionId) == NaN)
        return null;

    const transaction = await prisma.transaction.findFirst({
        where: { 
            AND:[
                { id : parseInt(transactionId) }
                ],
            OR: [
                { startedById : req.user.id},
                { transactionwithId : req.user.id}
            ]
         },
         include: {
             startedBy:true,
             transactionwith: {
                 include: {
                     city: true,
                     state:true,
                     country:true
                 }
             }
         }
    });
    prisma.$disconnect();
    return transaction;   
    
}






