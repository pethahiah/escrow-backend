const express = require('express');
const auth = require('../authjwt');
const CompanyRoute = express.Router();
const { PrismaClient } = require('@prisma/client');
const Validator = require('validatorjs');
const { companyrule } = require('../rules/companyrules');


const prisma = new PrismaClient();

CompanyRoute.post('/create_company', auth, async (req,res) =>{
    let validation = new Validator(req.body, companyrule);
    const status = validation.passes();

    if(status == false)
        return res.status(422).json({success:false, errors:{ message : validation.errors }});

    await prisma.$connect();

    const user = await prisma.user.findUnique({
        where: {
            email: req.user.email
        }
    });

    if(user.account_type == 'Individual')
        return res.status(400).json({success:false, errors:{ message : "You can not create a company because your account type is Individual" }});

    if(user.companyId != null)
        return res.status(400).json({success:false, errors:{ message : "Company Information Already Added" }});

    const company = await prisma.company.create({
        data:{
            name:req.body.name,
            address:req.body.address,
            user: {
                connect: { email: req.user.email },
              },
        }
    });

    await prisma.$disconnect();



    return res.status(201).json({success:true, message:"Company Information added successfully", data: company });

});
CompanyRoute.put('/edit_company/:companyId', auth, async (req,res) =>{
    let validation = new Validator(req.body, companyrule);
    const status = validation.passes();

    if(status == false)
        return res.status(422).json({success:false, errors:{ message : validation.errors }});
    
    await prisma.$connect();  

    if(typeof parseInt(req.params.companyId) != "number")
        return res.status(422).json({success:false, errors:{ message : "Invalid Company ID" }});

    const company = await prisma.company.findUnique({
        where:{id: parseInt(req.params.companyId) }
    });

    if(company == null)
        return res.status(422).json({success:false, errors:{ message : 'Company not Found' }});

    const editcompany = await prisma.company.update({
        where:{
            id:company.id
        },
        data:{
            name:req.body.name,
            address:req.body.address,
        }
    });

    await prisma.$disconnect();

    return res.status(201).json({success:true, message:"Company Information updated successfully", data: editcompany });

});
CompanyRoute.get('/get_company', auth, async (req,res) =>{
    
    await prisma.$connect();
    
    const company = await prisma.company.findUnique({
        where:{
            id:req.user.companyId
        }
    });

    await prisma.$disconnect();

    return res.status(200).json({success:true, message:"Company Information retrieved successfully", data: company });

});
CompanyRoute.get('/get_invite/:inviteType', auth, async (req,res) =>{
    
    await prisma.$connect();

    const invites = await prisma.invitee.findMany({
        where: { 
            invitedById : req.user.id,
            inviteType : 'Company'
         },
         include:{
             invitedBy:true,
             myprofile:true
         }
    });

    await prisma.$disconnect();

    return res.status(200).json({success:true, message:"Company Information retrieved successfully", data: invites });

});
module.exports = CompanyRoute;