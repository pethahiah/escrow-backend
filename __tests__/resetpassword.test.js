const app = require('../index');
const request = require("supertest");
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

beforeAll(async() => {
    let salt = bcrypt.genSaltSync(10);
    let hashpassword = bcrypt.hashSync('required1234', salt);
    const newuser = await prisma.user.create({
        data:{
            firstname: 'Omotayo',
            lastname: 'Ogunrinde',
            email: 'omotayo3@mail.com',
            password: hashpassword
        }
    });

    const passwordreset = await prisma.passwordReset.create({
        data: {
            email: 'omotayo3@mail.com',
            code: 'ABC'
        },
    }); 
});

afterAll(async () => {
  await prisma.user.deleteMany({
      where:{email:"omotayo3@mail.com"}
  });
  await prisma.passwordReset.deleteMany({
      where:{code:"ABC"}
  });
  await prisma.$disconnect();
});

describe("PUT /api/auth/resetpassword", () => {
  test("code or password is missing should respond with status code Error 422", async () => {
    const newuser = await request(app)
      .put("/api/auth/resetpassword")
      .send({
        code: '',
        password: 'required1234',
        password_confirmation: 'required123467'
      });

    expect(newuser.statusCode).toBe(422);
  });
  
  test("The given code is not the generated Code", async () => {
    const newuser = await request(app)
      .put("/api/auth/resetpassword")
      .send({
        code: 'XYZ',
        password: 'required1234',
        password_confirmation: 'required1234'
      });
    
    expect(newuser.statusCode).toBe(404);
  });
  test("It should reset the Password and respond with update password", async () => {
    const newuser = await request(app)
      .put("/api/auth/resetpassword")
      .send({
        code:"ABC",
        password: '12345678',
        password_confirmation: '12345678'
      });
    
      expect(newuser.statusCode).toBe(201);
      expect(newuser.body.message).toBe("Password Updated");
      expect(newuser.body.success).toBe(true);
  });
  test("User should be able to login with the new Password", async () => {
    const newuser = await request(app)
      .post("/api/auth/login")
      .send({
        email: 'omotayo3@mail.com',
        password: '12345678'
    });
      
        expect(newuser.statusCode).toBe(200);
        expect(newuser.body.data).toHaveProperty("id");
        expect(newuser.body).toHaveProperty("token");
        expect(newuser.body.success).toBe(true);

  
    });
  });