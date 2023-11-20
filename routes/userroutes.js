const express=require('express')
const path = require('path')
const user_Routes=express()
const collection=require('../model/userdb')
const session=require('express-session')
// const nocache = require('nocache');
const nodemailer=require("nodemailer");
const generateOtp=require("generate-otp")
const userController=require('../controller/userController')

// user_Routes.use(nocache()); 
// paring the user inputed data
user_Routes.use(express.urlencoded({extended : true}))
user_Routes.use(express.json())
// setting the static pages
user_Routes.use(express.static('public'))
// setting the view engines
user_Routes.set('view engine','ejs')
user_Routes.set('views','./views')
user_Routes.use(express.static(path.join(__dirname,'public')))


const userAuth=require("../middleware/userAuth")
// session handleing 
user_Routes.use(session({
    secret : "secret-key" ,
    saveUninitialized : false,
    resave : false
}))




user_Routes.get('/login',userController.loginLoad)


user_Routes.get('/signup',userController.signupLoad)

user_Routes.get('/',userAuth.isLogin,userController.homeLoad)

user_Routes.post("/login",userController.verifyLogin)
user_Routes.post('/signup',userController.insertUser)

user_Routes.get('/forgot',userController.forgotLoad)
user_Routes.post('/emailverify',userController.verifyEmail)
user_Routes.post('/passwordotp/:id',userController.forgototpverify)
user_Routes.post('/newpassword/:id',userController.setnewpassword)

user_Routes.get("/otp",userController.otpLoad) 
user_Routes.post("/otp",userController.verifyOtp)



user_Routes.get('/user/profile',userAuth.isLogin,userController.profileLoad)

user_Routes.get('/products',userAuth.isLogin,userController.productsLoad)
user_Routes.get('/productdetails/:id',userAuth.isLogin,userController.productdetail)


user_Routes.get('/profile/addaddress',userAuth.isLogin,userController.addaddressLoad)
user_Routes.post('/user/addaddress',userAuth.isLogin,userController.updateAddress)
user_Routes.get('/user/address/edit/:id',userAuth.isLogin,userController.editAddress)
user_Routes.post('/user/address/update/:id',userAuth.isLogin,userController.addressUpdate)

user_Routes.get('/user/profile/edit/:id',userAuth.isLogin,userController.editProfile)
user_Routes.post('/user/Profile/update/:id',userAuth.isLogin,userController.updateProfile)
user_Routes.get('/resetpassword',userController.resetLoad)
user_Routes.post('/resetpassword',userController.resetCheck)

user_Routes.get('/user/orders',userAuth.isLogin,userController.ordersLoad)
user_Routes.get('/cancelOrder/:id',userAuth.isLogin,userController.cancelOrder)

user_Routes.get('/user/cart',userController.cartLoad)
user_Routes.get('/addtocart/:id',userController.addToCart)
user_Routes.get('/cart/remove/:id',userController.removeFromCart)

user_Routes.post('/cart/update/:productId',userController.quantityUpdate)


user_Routes.get('/user/checkout',userAuth.isLogin,userController.checkoutLoad)
user_Routes.get('/user/checkout/address',userAuth.isLogin,userController.checkoutAddAddress)
user_Routes.post('/user/checkoutaddaddress',userAuth.isLogin,userController.updateCheckoutAddress)

user_Routes.get('/user/checkout/editaddress/:id',userAuth.isLogin,userController.editCheckoutLoad)
user_Routes.post('/user/checkout/updateaddress/:id',userAuth.isLogin,userController.updateeditCheckoutAddress)


user_Routes.post('/order/conform',userAuth.isLogin,userController.conformLoad)

user_Routes.post('/paypost',userController.paypost)

user_Routes.post('/logout',userController.userLogout)

module.exports=user_Routes;