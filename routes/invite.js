const express = require('express');
const auth = require('../authjwt');
const Validator = require('validatorjs');
const { invite } = require('../rules/inviterules');
const { authregister } = require('../rules/authrules');
const bcrypt = require('bcryptjs');
const InviteRoute = express.Router();

const { PrismaClient } = require('@prisma/client');
const User = require('../user');
const ProcessMail = require('../Processmail');
const { InviteeByEmail } = require("../find");
const { ProcessInvite } = require('../processinviterequest');


const prisma = new PrismaClient();


InviteRoute.post('/inviteuser', auth, async (req,res) => {
    let validation = new Validator(req.body, invite);
    const status = validation.passes(); 

    if(status == false)
        return res.status(422).json({success: false, errors: { message : validation.errors }});

    await prisma.$connect();  

    const currentuser = await prisma.user.findUnique({
        where: {
            id: req.user.id,
        }
    });    

    if(currentuser.companyId == null && req.body.invitetype == 'Company')
        return res.status(200).json({success: false, errors: { message : "You need to create company before you can send company Invite" }});    


    const user = await prisma.user.findUnique({
        where: {
            email: req.body.email,
        }
    });    
       
    if(user)
        return res.status(200).json({success: false, errors: { message : "User Already Exist on the Platform" } });

    const userinvitedbefore = await prisma.invitee.findUnique({
        where: {
            email: req.body.email,
        }
    });  
    
    if(userinvitedbefore)
    {
        //Send Mail to New User, but dont add to list of new invite
        const response = await ProcessMail('Invite To Use Escrow Platform',req.body.email,null,userinvitedbefore.name, req.user.firstname);
        return res.status(200).json({success: true, message : "User Invite Sent Successfully"  });
    }

    const inviteuser =  await prisma.invitee.create({
        data: {
            name: req.body.name,
            email: req.body.email,
            inviteType: req.body.invitetype,
            message_for_invite: req.body.message_for_invite,
            invitedById: req.user.id
        }
    });

    await prisma.$disconnect();

    //Send Mail to New User
    const response = await ProcessMail('Invite To Use Escrow Platform',req.body.email,null,inviteuser.name,req.user.firstname);

    return res.status(200).json({success: true, message : "User Invite Sent Successfully"   });
    
});

InviteRoute.get('/get_invite/:inviteType', auth, async (req,res) =>{
    
    await prisma.$connect();

    const invites = await prisma.invitee.findMany({
        where: { 
            invitedById : req.user.id,
            inviteType:req.params.inviteType
         },
         include:{
             invitedBy:true,
             myprofile:true
         }
    });

    await prisma.$disconnect();

    return res.status(200).json({success:true, message:"User Information retrieved successfully", data: invites  });

});

InviteRoute.post('/receiveInvitedUser', async (req, res) => {
    let validation = new Validator(req.body, authregister);
    const status = validation.passes(); 
    let newdata = {};
    if(status == false)
        return res.status(422).json({success: false, errors: { message : validation.errors }});
    
    await prisma.$connect();

    const user = await prisma.user.findUnique({
        where: {
          email: req.body.email,
        }
    });

    if(user)
        return res.status(400).json({ success: false, errors: { message : "User Already Created. Proceed to Log In"}})

    const invite = await InviteeByEmail(req.body.email);

    if(!invite)
        return res.status(404).json({ success: false, errors: { message : "Unknown Invite"}})

    const newuser = ProcessInvite(req,res, invite);

    await prisma.$disconnect();
    return res.status(201).json({ success: true, user: newuser }); 
})

module.exports = InviteRoute;