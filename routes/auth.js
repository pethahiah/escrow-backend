const express = require('express');
const Validator = require('validatorjs');
const { authregister, authforgotpassword, authlogin, authresetpassword } = require('../rules/authrules');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const randomize = require('randomatic');
const jwt = require('jsonwebtoken');
const ProcessMail = require('../Processmail');
const { InviteeByEmail } = require('../find');
const { ProcessInvite } = require('../processinviterequest');


const prisma = new PrismaClient()

const AuthRoute = express.Router();

AuthRoute.post('/register', async (req,res) => {
    let validation = new Validator(req.body, authregister);
    const status = validation.passes(); 

    if(status == false)
        return res.status(422).json({success: false, errors: { message : validation.errors }});
    

    await prisma.$connect();

    const user = await prisma.user.findUnique({
        where: {
          email: req.body.email,
        }
    });

    if(user)
        return res.status(200).json({success: false, errors: { message : "Email Already Exist" } });

    let salt = bcrypt.genSaltSync(10);
    let hashpassword = bcrypt.hashSync(req.body.password, salt);

    const invite = await InviteeByEmail(req.body.email)
    let data = {};
    if(invite != null)
    {
        const newuser = ProcessInvite(req,res, invite);
        return res.status(201).json({ success: true, data: newuser }); 
    }
    const newuser = await prisma.user.create({
        data: {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: hashpassword
        },

    });  

    await prisma.$disconnect();
    
    newuser.password = null;
    const response = ProcessMail('Registration',req.body.email,null,req.body.firstname);
    return res.status(201).json({success: true, message : "Account Created Successfully", data: newuser });

});

AuthRoute.post('/login', async (req,res) => {

    let validation = new Validator(req.body, authlogin);
    const status = validation.passes(); 

    if(status == false)
        return res.status(422).json({success: false, errors: { message : validation.errors }});
    
    await prisma.$connect();

    let user = await prisma.user.findUnique({
        where: {
          email: req.body.email,
        },
        include:{
            city:true,
            state:true,
            country:true
        }
    });

    if(!user)
        return res.status(404).json({success: false, errors: { message : "User not Found" } });

    let matched = bcrypt.compareSync(req.body.password, user.password); 

    if(!matched)
        return res.status(200).json({success: false, errors: { message : "Email and Password Mismatched"} });

    const token = jwt.sign({ user: user }, process.env.SECRET);
    user.password = null;

    await prisma.$disconnect();
    
    return res.status(200).json({success: true, message : "Data Retrieved", data: user, token : token});    

});

AuthRoute.post('/forgotpassword', async (req,res) => {

    let validation = new Validator(req.body, authforgotpassword);
    const status = validation.passes(); 

    if(status == false)
        return res.status(422).json({success: false, errors: { message : validation.errors }});
    
    await prisma.$connect();

    const user = await prisma.user.findUnique({
        where: {
          email: req.body.email,
        }
    });

    if(!user)
        return res.status(404).json({success: false, errors: { message : "User not Found" } });

    const code = randomize('Aa0', 6);
    const passwordreset = await prisma.passwordReset.create({
        data: {
            email: req.body.email,
            code: code
        },
    }); 

    await prisma.$disconnect();
    const response = await ProcessMail('ForgotPassword',req.body.email,code,user.firstname);
    return res.status(201).json({success: true, message : "Email Sent to your Account", data : passwordreset});    

});

AuthRoute.put('/resetpassword', async (req,res) => {

    let validation = new Validator(req.body, authresetpassword);
    const status = validation.passes(); 

    if(status == false)
        return res.status(422).json({success: false, errors: { message : validation.errors }});
    
    await prisma.$connect();
    
    const passwordreset = await prisma.passwordReset.findFirst({
        where: {
          code: req.body.code,
          active: true
        }
    });

    if(!passwordreset)
        return res.status(404).json({success: false, errors: { message : "Code Invalid" } });

    let salt = bcrypt.genSaltSync(10);
    let hashpassword = bcrypt.hashSync(req.body.password, salt);

    const updateUser = prisma.user.update({
        where: {
            email: passwordreset.email,
        },
        data: {
            password: hashpassword,
        },
    }) 

    const DeactivateCode = prisma.passwordReset.update({
        where: {
            code: req.body.code
        },
        data: {
            active: false,
        },
    })

    await prisma.$transaction([updateUser, DeactivateCode])

    await prisma.$disconnect();
    const response = await ProcessMail('ResetPassword',passwordreset.email,null,updateUser.firstname);
    return res.status(201).json({success: true, message : "Password Updated", data : updateUser});    

});

module.exports = AuthRoute;