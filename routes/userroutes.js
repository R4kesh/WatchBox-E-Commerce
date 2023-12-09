const express=require('express')
const path = require('path')
const user_Routes=express()
const collection=require('../model/userdb')
const session=require('express-session')
// const nocache = require('nocache');
const nodemailer=require("nodemailer");
const generateOtp=require("generate-otp")
const userController=require('../controller/userController')
const profileController=require('../controller/userController/profileController')
const wishlistController=require('../controller/userController/wishlistController')
const cartController=require('../controller/userController/cartController')
const checkoutController=require('../controller/userController/checkoutController')
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



user_Routes.get('/user/profile',userAuth.isLogin,profileController.profileLoad);

user_Routes.get('/products',userAuth.isLogin,userController.productsLoad)
user_Routes.get('/productdetails/:id',userAuth.isLogin,userController.productdetail)

user_Routes.get('/product/category/:id',userAuth.isLogin,userController.categorywiseLoad)

user_Routes.get('/profile/addaddress',userAuth.isLogin,profileController.addaddressLoad)
user_Routes.post('/user/addaddress',userAuth.isLogin,profileController.updateAddress)
user_Routes.get('/user/address/edit/:id',userAuth.isLogin,profileController.editAddress)
user_Routes.post('/user/address/update/:id',userAuth.isLogin,profileController.addressUpdate)

user_Routes.get('/user/profile/edit/:id',userAuth.isLogin,profileController.editProfile)
user_Routes.post('/user/Profile/update/:id',userAuth.isLogin,profileController.updateProfile)
user_Routes.get('/resetpassword',userAuth.isLogin,profileController.resetLoad)
user_Routes.post('/resetpassword',userAuth.isLogin,profileController.resetCheck)
user_Routes.get('/invoice/:id',userAuth.isLogin,profileController.invoice)

user_Routes.get('/profile/wallet',profileController.walletLoad)

user_Routes.get('/user/orders',userAuth.isLogin,profileController.ordersLoad)
user_Routes.get('/cancelOrder/:id',userAuth.isLogin,profileController.cancelOrder)
user_Routes.get('/viewMore/:id',userAuth.isLogin,profileController.viewMore)

user_Routes.post('/returnOrder/:id',profileController.returnOrder)

user_Routes.get('/user/cart',userAuth.isLogin,cartController.cartLoad)
user_Routes.get('/addtocart/:id',userAuth.isLogin,cartController.addToCart)
user_Routes.get('/cart/remove/:id',userAuth.isLogin,cartController.removeFromCart)
user_Routes.post('/cart/update/:productId',userAuth.isLogin,cartController.quantityUpdate)
user_Routes.get("/apply-coupon",userAuth.isLogin,cartController.couponAdd)



user_Routes.get('/user/wishlist',userAuth.isLogin,wishlistController.wishLoad)
user_Routes.get('/addtowish/:id',userAuth.isLogin,wishlistController.addToWish)
user_Routes.get('/wishlist/remove/:id',userAuth.isLogin,wishlistController.removeFromWishlist)
user_Routes.get('/wishlist/cart/:id',userAuth.isLogin,wishlistController.wishlistAddCart)





user_Routes.post('/user/cart',userAuth.isLogin,checkoutController.checkoutLoad)
user_Routes.get('/user/checkout',userAuth.isLogin,checkoutController.checkoutLoad)
user_Routes.get('/user/checkout/address',userAuth.isLogin,checkoutController.checkoutAddAddress)
user_Routes.post('/user/checkoutaddaddress',userAuth.isLogin,checkoutController.updateCheckoutAddress)
user_Routes.get('/user/checkout/editaddress/:id',userAuth.isLogin,checkoutController.editCheckoutLoad)
user_Routes.post('/user/checkout/updateaddress/:id',userAuth.isLogin,checkoutController.updateeditCheckoutAddress)
user_Routes.post('/order/conform',userAuth.isLogin,checkoutController.conformLoad)

user_Routes.post('/paypost',userController.paypost)

user_Routes.post('/logout',userController.userLogout)

module.exports=user_Routes;