const express = require('express');
const auth = require('../authjwt');
const ProfileRoute = express.Router();
const Validator = require('validatorjs');
const { PrismaClient } = require('@prisma/client');
const { ProcessFile } = require('../processfile');
const { profileupdate, accounttype } = require('../rules/updateprofile');


const prisma = new PrismaClient();

ProfileRoute.post('/complete_profile', auth, async (req,res) =>{
    
    const validation = new Validator(req.body, profileupdate);
    const status = validation.passes();

    if(status == false)
        return res.status(422).json({success: false, errors: { message : validation.errors }});
  
    const user = await prisma.user.findUnique({
        where: {
            email: req.user.email,
          }
    });

    if(!user)
        return res.status(404).json({success: false, errors: { message : 'User not Found'} });

    if(req.files)    
    {
        const responses = ProcessFile(req.files.profile_image)  

        if(responses == null)
            return res.status(404).json({success: false, errors: { message : 'Upload a valid image'} });   
        
        await req.files.profile_image.mv(responses.path, (err) => {
            if (err) {
                console.log(err)
                return res.status(500).json({success: false, errors: { message : err} });
            }
            req.body.profile_image = responses.filename;
            UpdateUser(req,res, user)
        });
    }else {
        req.body.profile_image = user.profile_image;
        UpdateUser(req, res, user)
    }

});

ProfileRoute.post('/updateaccounttype', auth, async (req,res) => {

    const validation = new Validator(req.body, accounttype);
    const status = validation.passes();

    if(status == false)
        return res.status(422).json({success: false, errors: { message : validation.errors }});
  
    const user = await prisma.user.update({
        where: {
            id : req.user.id
        },
        data: {
            account_type: req.body.account_type
        },
        include:{
            city:true,
            state:true,
            country:true
        }
    });

    return res.status(201).json({ success: true, data: user  })

})


async function UpdateUser(req, res, user)
{
    let state, country, city;
    if(req.body.state != '')
        state = parseInt(req.body.state);
    if(req.body.country != '')
        country = parseInt(req.body.country); 
    if(req.body.city != '')
        city = parseInt(req.body.city);       
    const updateuser = await prisma.user.update({
        where: {
            email: req.user.email,
        },
        data: {
            profile_image: req.body.profile_image,
            address: req.body.address == '' ? user.address : req.body.address,
            stateId: req.body.state == '' ? user.stateId : state,
            countryId:req.body.country == '' ? user.countryId : country,
            cityId:req.body.city == '' ? user.cityId : city,
            phone_number: req.body.phone_number == '' ? user.phone_number : req.body.phone_number,
            gender: req.body.gender == '' ? user.gender : req.body.gender,
            account_type: req.body.accounttype == '' ? user.account_type : req.body.accounttype
        },
         include:{
            city:true,
            state:true,
            country:true
        }
    });
    
    updateuser.password = null
    return res.status(201).json({success: true, message: "Updated Successfully", user: updateuser });

}

ProfileRoute.get('/allusers', auth, async (req, res) => {

    try
    {
        const users = await prisma.user.findMany({
            include:{
            city:true,
            state:true,
            country:true
        }});
        console.log(users);
        res.status(200).json({success: true, data : users })

    }catch(e)
    {
        console.log(e);
        res.status(400).json({success: false, errors : { message : "No user"} })

    }

});

module.exports = ProfileRoute;