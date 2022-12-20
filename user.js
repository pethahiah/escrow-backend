const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');


const prisma = new PrismaClient();

const User = async (userId) => {
    const user = await prisma.user.findUnique({
        where: {
            id: 1,
        }
    }); 
    return user;
};

module.exports = User;
