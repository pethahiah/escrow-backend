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

// afterEach(async() => {
//     await prisma.order.deleteMany({});
//     await prisma.witness.deleteMany({});
//     await prisma.invitee.deleteMany({});
// });

afterAll(async() => {
    await prisma.transaction.deleteMany({});
    await prisma.user.delete({
        where:{email: 'orderuser2@mail.com'}
    });
    
    await prisma.city.deleteMany({});
    await prisma.state.deleteMany({});
    await prisma.country.deleteMany({});
    
    
    await prisma.$disconnect();
});

describe("POST /api/order/create",() =>{
    test('User Logged In Successfully respond with user information plus token', async () => {
        const user = await request(app)
        .post("/api/auth/login")
        .send({
            email: 'orderuser2@mail.com',
            password: 'required1234'
        });

        expect(user.statusCode).toBe(200);
        expect(user.body.data).toHaveProperty("id");
        expect(user.body).toHaveProperty("token");
        expect(user.body.success).toBe(true);
    })

    test('Creating a new Transaction', async () => {
        transaction = await request(app)
        .post("/api/transaction/create_transaction")
        .set("Authorization",`Bearer ${token}`)
        .send({});

        expect(transaction.statusCode).toBe(201);
    });

    test('Create Order 1', async () => {
        const order = await request(app)
        .post("/api/order/create_order")
        .set("Authorization",`Bearer ${token}`)
        .send({
            name: 'Television',
            quantity: 1,
            unit_cost: 30000,
            total_cost:30000,
            transactionId: transaction.id,
            order_description: 'okay',
            other_information:'okay',
            date_of_delivery:'2021-07-07',
            mode_of_delivery:'Pick Up'
        });

        expect(order.statusCode).toBe(201);
    })

    test('Create Order 2', async () => {
        const order = await request(app)
        .post("/api/order/create_order")
        .set("Authorization",`Bearer ${token}`)
        .send({
            name: 'Fan',
            quantity: 1,
            unit_cost: 30000,
            total_cost: 30000,
            transactionId: transaction.id,
            order_description: 'okay',
            other_information:'okay',
            date_of_delivery:'2021-07-07',
            mode_of_delivery:'Pick Up'
        });

        expect(order.statusCode).toBe(201);
    });

    test('Get Total Order', async () => {
        const order = await request(app)
        .get("/api/order/get_orders")
        .set("Authorization",`Bearer ${token}`)
        .send();

        expect(order.statusCode).toBe(200);
        expect(order.length).toBe(2);
    })
});    

