const express = require('express');
const auth = require('../authjwt');
const SettingRoute = express.Router();
const { PrismaClient } = require('@prisma/client');
const Validator = require('validatorjs');
const { settingrule } = require('../rules/companyrules');


const prisma = new PrismaClient();

SettingRoute.post('/create_setting', auth, async (req,res) =>{
    let validation = new Validator(req.body, settingrule);
    const status = validation.passes();

    if(status == false)
        return res.status(422).json({success:false, errors:{ message : validation.errors }});

    await prisma.$connect();

    const setting = await prisma.setting.create({
        data:{
            secret_key:req.body.secret_key,
            application_id:req.body.application_id,
            product_id:req.body.product_id,
        }
    });

    await prisma.$disconnect();



    return res.status(201).json({success:true, message:"Setting added successfully", data: setting });

});
SettingRoute.put('/edit_setting/:settingId', auth, async (req,res) =>{
    let validation = new Validator(req.body, settingrule);
    const status = validation.passes();

    if(status == false)
        return res.status(422).json({success:false, errors:{ message : validation.errors }});
    
    await prisma.$connect();  

    if(typeof parseInt(req.params.settingId) != "number")
        return res.status(422).json({success:false, errors:{ message : "Invalid Setting ID" }});

    const setting = await prisma.setting.findUnique({
        where:{id: parseInt(req.params.settingId) }
    });

    if(setting == null)
        return res.status(422).json({success:false, errors:{ message : 'Setting not Found' }});

    const editsetting = await prisma.setting.update({
        where:{
            id:company.id
        },
        data:{
            secret_key:req.body.secret_key,
            application_id:req.body.application_id,
            product_id:req.body.product_id,
            testmode:req.body.testmode
        }
    });

    await prisma.$disconnect();

    return res.status(201).json({success:true, message:"Setting updated successfully", data: editsetting });

});
SettingRoute.get('/get_setting', auth, async (req,res) =>{
    
    await prisma.$connect();
    
    const setting = await prisma.setting.findFirst();

    await prisma.$disconnect();

    return res.status(200).json({success:true, message:"setting Information retrieved successfully", data: setting });

});

module.exports = SettingRoute;