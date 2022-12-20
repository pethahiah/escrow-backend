const express = require('express');
AddressRoute = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

AddressRoute.get('/countries',async (req, res) => {
    const countries = await prisma.country.findMany()
    return res.status(200).json({success: true, data:countries  });
});

AddressRoute.get('/states/:countryId',async (req, res) => {

    const states = await prisma.state.findMany({
        where:{
            country_id: parseInt(req.params.countryId)
        }
    })
    return res.status(200).json({success: true, data:states  });
});

AddressRoute.get('/cities/:stateId',async (req, res) => {

    const cities = await prisma.city.findMany({
        where:{
            state_id: parseInt(req.params.stateId)
        }
    });
    return res.status(200).json({success: true, data:cities  });
});

module.exports = AddressRoute;