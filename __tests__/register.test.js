const request = require("supertest");
const app = require("../index");
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

afterAll(async () => {
  await prisma.user.deleteMany({
    where:{email:"ogunrinde@mail.com"}
  });
  await prisma.$disconnect();

});
describe("POST /api/auth/register", () => {

  test("Firstname or lastname missing should respond with status code 422", async () => {
    const newuser = await request(app)
      .post("/api/auth/register")
      .send({
        firstname: '',
        lastname: '',
        email: 'ogunrinde@mail.com',
        password: 'required1234',
        password_confirmation: 'required1234'
      });

    expect(newuser.statusCode).toBe(422);
  });
  test("Invalid Email should respond with status code 422", async () => {
    const newuser = await request(app)
      .post("/api/auth/register")
      .send({
        firstname: 'Omotayo',
        lastname: 'Ogunrinde',
        email: 'ogunrinde',
        password: 'required1234',
        password_confirmation: 'required1234'
      });
    
    expect(newuser.statusCode).toBe(422);
  });
  test("Password does not Match", async () => {
    const newuser = await request(app)
      .post("/api/auth/register")
      .send({
        firstname: 'Omotayo',
        lastname: 'Ogunrinde',
        email: 'ogunrinde@mail.com',
        password: '12345678',
        password_confirmation: '1234567890'
      });
    
    expect(newuser.statusCode).toBe(422);
  });
  test("It responds with the newly created User", async () => {
    const newuser = await request(app)
      .post("/api/auth/register")
      .send({
        firstname: 'Omotayo',
        lastname: 'Ogunrinde',
        email: 'ogunrinde@mail.com',
        password: '12345678',
        password_confirmation: '12345678'
    });
      
      expect(newuser.body.data).toHaveProperty("id");
      expect(newuser.body.success).toBe(true);
      expect(newuser.statusCode).toBe(201);

  
    });
  });