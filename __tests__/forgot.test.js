const request = require("supertest");
const app = require("../index");
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

beforeAll(async() => {
    let salt = bcrypt.genSaltSync(10);
    let hashpassword = bcrypt.hashSync('required1234', salt);
    const newuser = await prisma.user.create({
        data:{
            firstname: 'Omotayo',
            lastname: 'Ogunrinde',
            email: 'omotayo1@mail.com',
            password: hashpassword
        }
    });
});

afterAll(async () => {
  await prisma.user.deleteMany({
      where:{email:"omotayo1@mail.com"}
  });
  await prisma.$disconnect();
});

describe("POST /api/auth/forgotpassword", () => {
    test('Email field is Invalid', async () => {
        const newuser = await request(app)
        .post("/api/auth/forgotpassword")
        .send({
            email: 'omotayo'
        });

        expect(newuser.statusCode).toBe(422);
    })
    test('User Email not Found', async () => {
        const newuser = await request(app)
        .post("/api/auth/forgotpassword")
        .send({
            email: 'omotayo1234@mail.com'
        });

        expect(newuser.statusCode).toBe(404);
        expect(newuser.body.errors.message).toBe("User not Found");
    });

    test('Request has send mail to User', async () => {
        const newuser = await request(app)
        .post("/api/auth/forgotpassword")
        .send({
            email: 'omotayo1@mail.com'
        });

        expect(newuser.statusCode).toBe(201);
        expect(newuser.body.data).toHaveProperty("id");
    });

})