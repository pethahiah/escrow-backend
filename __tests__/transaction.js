const request = require("supertest")
const app =  require("../index");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const prisma = new PrismaClient();
let token;

beforeAll( async() => {
    let salt = bcrypt.genSaltSync(10);
    let hashpassword = bcrypt.hashSync('required1234', salt);
    country = await prisma.country.create({
        data:{
            sortname: 'NG123',
            name: 'Nigeria',
            phonecode: '234',
        }
    });
    state = await prisma.state.create({
        data:{
            name: 'Lagos',
            country_id: country.id,
        }
    });
    city = await prisma.city.create({
        data:{
            name: 'Lagos',
            state_id: state.id,
        }
    });
    user = await prisma.user.create({
        data:{
            firstname: 'Omotayo',
            lastname: 'Ogunrinde',
            email: 'orderuser@mail.com',
            password: hashpassword,
            countryId : country.id,
            stateId: state.id,
            cityId: city.id,
            gender: 'Male',
            address: "My address",
            phone_number:"09021212121"
        }
    });
    token = jwt.sign({ user: user }, process.env.SECRET);

});

afterEach(async() => {
     
});

afterAll(async() => {
    
    await prisma.transaction.deleteMany({});
    await prisma.user.delete({
        where:{email: 'orderuser@mail.com'}
    });
    
    await prisma.city.deleteMany({});
    await prisma.state.deleteMany({});
    await prisma.country.deleteMany({});

    await prisma.invitee.deleteMany({});
    
    
    await prisma.$disconnect();
});

describe("POST /api/transaction/create_transaction",() =>{
    test('User Logged In Successfully respond with user information plus token', async () => {
        const user = await request(app)
        .post("/api/auth/login")
        .send({
            email: 'orderuser@mail.com',
            password: 'required1234'
        });

        expect(user.statusCode).toBe(200);
        expect(user.body.data).toHaveProperty("id");
        expect(user.body).toHaveProperty("token");
        expect(user.body.success).toBe(true);
    });

    
    test('Creating a new Transaction', async () => {
        const transaction = await request(app)
        .post("/api/transaction/create_transaction")
        .set("Authorization",`Bearer ${token}`)
        .send({});

        expect(transaction.statusCode).toBe(201);
    });

    test('Get Transactions', async () => {
        const transaction = await request(app)
        .get("/api/transaction/get_transactions")
        .set("Authorization",`Bearer ${token}`);

        expect(transaction.statusCode).toBe(200);
        expect(transaction.body.transactions.length).toBe(1);
    });
});        


