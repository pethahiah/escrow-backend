const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');


const prisma = new PrismaClient();

const ProfileCompleted = async (req, res, next) => {
    const user = await prisma.user.findUnique({
        where: {
            email: req.user.email,
        }
    }); 
    //console.log(user)
    let status = true;

    if(user.address == null) status = false;
    if(user.gender == null)  status = false;
    if(user.cityId == null)  status = false;
    if(user.stateId == null) status = false;
    if(user.countryId == null) status = false;

    if(status == false)
        return res.status(403).json({success: false, errors: { message : "Access Denied, Kindly Complete your Profile to Create/View Transaction Request" } });

    next();
};

module.exports = ProfileCompleted;