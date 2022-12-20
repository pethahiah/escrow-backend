const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');



exports.ProcessInvite = async (req, res, invite) => {
    const transaction_invite = await prisma.invite_Transaction_Link.findMany({
        where: { inviteId : invite.id}
    })

    const witness_invite = await prisma.invite_Witness_Link.findMany({
        where: { inviteId : invite.id}
    })

    if(invite.inviteType == 'Company')
    {
        const creator = await prisma.user.findUnique({
            where: {
                email: req.body.email
            }
        });
        newdata = {
            companyId : creator.companyId
        }
    }

    let salt = bcrypt.genSaltSync(10);
    let hashpassword = bcrypt.hashSync(req.body.password, salt);
    

    newdata = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: hashpassword,
            profile: {
                    connect: {
                        email: req.body.email
                    }
            },
    }



    if(transaction_invite.length > 0)
    {
        let trans_with = [];
        transaction_invite.forEach((invite) => {
            trans_with.push({id: invite.transactionId})
        })
        newdata.transaction_with =  {
            connect: trans_with,
    
        }
    } 

    if(witness_invite.length > 0)
    {
        let witness_with = [];
        witness_invite.forEach((invite) => {
            witness_with.push(
                {transactionId: invite.transactionId}
            );
        })
        newdata.witness = {
            create: witness_with
        }
    }    

    const newuser = await prisma.user.create({
        data: {
            ...newdata
        }
    });

    return newuser;
}
