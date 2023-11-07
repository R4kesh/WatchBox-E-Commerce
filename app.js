const express=require('express')
const app=express()
const session=require('express-session')
const nocache = require('nocache');


app.use(nocache()); 

app.use(session({
    secret : "secret-key" ,
    saveUninitialized : false,
    resave : false
}))

const userroutes=require('./routes/userroutes')
app.use('/',userroutes)

const adminroutes=require('./routes/adminroutes')
app.use('/',adminroutes)

app.listen(3000,()=>{
    console.log('Server started')
})