const app = require('../index');
const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcryptjs');
const request = require("supertest");
const prisma = new PrismaClient();

beforeAll(async() => {
    let salt = bcrypt.genSaltSync(10);
    let hashpassword = bcrypt.hashSync('required1234', salt);
    await prisma.user.create({
        data:{
            firstname: 'Omotayo',
            lastname: 'Ogunrinde',
            email: 'omotayo2@mail.com',
            password: hashpassword
        }
    });
})

afterAll(async() => {
    await prisma.user.deleteMany({
        where:{email:"omotayo2@mail.com"}
    });
    await prisma.$disconnect();
});

describe("POST /api/auth/login", () => {
    test('Email field is Empty', async () => {
        const newuser = await request(app)
        .post("/api/auth/login")
        .send({
            email: 'omotayo',
            password: 'required1234'
        });

        expect(newuser.statusCode).toBe(422);
    })
    test('Wrong login Credentials', async () => {
        const newuser = await request(app)
        .post("/api/auth/login")
        .send({
            email: 'omotayo1234@mail.com',
            password: 'required1234'
        });

        expect(newuser.statusCode).toBe(404);
        expect(newuser.body.errors.message).toBe("User not Found");
    });

    test('Email is Valid but Password is Wrong', async () => {
        const newuser = await request(app)
        .post("/api/auth/login")
        .send({
            email: 'omotayo2@mail.com',
            password: 'required12345678'
        });

        expect(newuser.statusCode).toBe(200);
        expect(newuser.body.errors.message).toBe("Email and Password Mismatched");
    });

    test('User Logged In Successfully respond with user information plus token', async () => {
        const newuser = await request(app)
        .post("/api/auth/login")
        .send({
            email: 'omotayo2@mail.com',
            password: 'required1234'
        });

        expect(newuser.statusCode).toBe(200);
        expect(newuser.body.data).toHaveProperty("id");
        expect(newuser.body).toHaveProperty("token");
        expect(newuser.body.success).toBe(true);
    })
})