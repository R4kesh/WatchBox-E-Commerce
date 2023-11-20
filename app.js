const express=require('express')
const app=express()
const session=require('express-session')
const nocache = require('nocache');
const errorHandler=require('./middleware/errorMiddleware')



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

app.use(errorHandler);

app.listen(3000,()=>{
    console.log('Server started')
})