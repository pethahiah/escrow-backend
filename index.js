const express = require('express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
const swaggerUI =  require('swagger-ui-express');
const AuthRoute = require('./routes/auth');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const InviteRoute = require('./routes/invite');
const ProfileRoute = require('./routes/profile');
const SettingRoute = require('./routes/setting');
const PaymentRoute = require('./routes/payment');
const fileUpload = require('express-fileupload');
const CompanyRoute = require('./routes/company');
const AddressRoute = require('./routes/address');
const OrderRoute = require("./routes/order");
var cors = require('cors')
const app = express();
app.use(cors())
app.use(express.json())
const ProcessMail = require('./Processmail');
const TransactionRoute = require('./routes/transaction');
const AgreementRoute = require('./routes/agreement');
const MessageRoute = require('./routes/message');
const PrivateRoute = require('./routes/privateinformation');
const WitnessViewRoute = require('./routes/witnessview');
app.get('/',async function(req,res){
    const response = await ProcessMail('Registration','ogunrindeomotayo@gmail.com',null,'firstname');
    res.json({message: response});
});
app.use(fileUpload({createParentPath: true}));
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use('/api/auth', AuthRoute);
app.use('/api/invite',InviteRoute);
app.use('/api/profile',ProfileRoute);
app.use('/api/company',CompanyRoute);
app.use('/api/address',AddressRoute);
app.use('/api/order', OrderRoute);
app.use('/api/transaction', TransactionRoute);
app.use('/api/agreement', AgreementRoute);
app.use('/api/message', MessageRoute);
app.use('/api/bank', PrivateRoute);
app.use('/api/witnessview', WitnessViewRoute)
app.use('/api/setting', SettingRoute)
app.use('/api/payment', PaymentRoute)
module.exports = app;
