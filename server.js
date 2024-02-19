/**
 * For Third-party Integrated Group Demo
 * @author Rogger Lau<liuxianfu@live.com>
 * @version 1.0.0
 */
const express = require('express');
const path = require('path');
const app = express();


const bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

const userRouter = require('./router/telebirrRouter');
app.use(express.static(path.join(__dirname,'/static')));
app.use('/telebirr', userRouter);

app.listen(28888,()=>{
    console.log(module);
    console.log('telebirrpay nodejs demo running...');
})
