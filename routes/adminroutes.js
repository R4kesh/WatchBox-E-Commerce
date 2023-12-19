const express=require('express')
const admin_Routes=express()
const path =require('path')
const session=require('express-session')
const adminController=require('../controller/adminController')
const productController=require('../controller/adminController/productController')
const categoryController=require('../controller/adminController/categoryController')
const couponController=require('../controller/adminController/couponController')
const returnController=require('../controller/adminController/returnController')
const adminAuth=require('../middleware/adminAuth')



const multer=require('multer')

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/productimg'))
    },
    filename:function(req,file,cb){
        const name=Date.now()+'-'+file.originalname;
        cb(null,name)
    }
})
const upload=multer({storage:storage}).array('image',3)


admin_Routes.use(express.urlencoded({extended : true}))
admin_Routes.use(express.json())
admin_Routes.use(express.static('public'))

admin_Routes.set('view engine','ejs')
admin_Routes.set('views','./views/admin')
admin_Routes.use(express.static(path.join(__dirname,'public')))

admin_Routes.use(session({
    secret : "something" ,
    saveUninitialized : false,
    resave : false
}))

admin_Routes.get('/admin',adminController.adminLog)
admin_Routes.post('/admin',adminController.adminHome)


admin_Routes.get('/admin/users',adminAuth.isLogin,adminController.usersLoad)

admin_Routes.post('/admin/block/:id',adminAuth.isLogin,adminController.userBlock)
admin_Routes.post('/admin/unblock/:id',adminAuth.isLogin,adminController.userUnblock)

admin_Routes.get('/admin/category',adminAuth.isLogin,categoryController.categoryLoad)
admin_Routes.get('/admin/category/add',adminAuth.isLogin,categoryController.addcategory)
admin_Routes.post('/admin/category/add',adminAuth.isLogin,categoryController.insertCategory)

admin_Routes.get('/admin/products',adminAuth.isLogin,productController.productsLoad)
admin_Routes.get('/admin/products/add',adminAuth.isLogin,productController.addProduct)
admin_Routes.post('/admin/Products/add',adminAuth.isLogin,upload,productController.insertProduct)

admin_Routes.get('/admin/products/delete/:id',adminAuth.isLogin,productController.deleteProduct)
admin_Routes.get('/admin/products/undelete/:id',adminAuth.isLogin,productController.undeleteProduct)
admin_Routes.get('/admin/products/edit/:id',adminAuth.isLogin,productController.editProduct)
admin_Routes.post('/admin/products/update/:id',adminAuth.isLogin,upload,productController.updateProduct)

admin_Routes.get('/admin/category/delete/:id',adminAuth.isLogin,categoryController.deletecategory)
admin_Routes.get('/admin/category/undelete/:id',adminAuth.isLogin,categoryController.undeletecategory)
admin_Routes.get('/admin/category/edit/:id',adminAuth.isLogin,categoryController.editCategory)
admin_Routes.post('/admin/category/update/:id',adminAuth.isLogin,categoryController.updateCategory)

admin_Routes.get('/admin/orders',adminAuth.isLogin,adminController.ordersLoad)
admin_Routes.get('/updateOrderStatus/:userId/:orderId/:newStatus',adminAuth.isLogin,adminController.updateOrderStatus)
admin_Routes.get("/exportOrdersToExcel", adminController.excelsheet)

admin_Routes.get("/admin/Coupon",adminAuth.isLogin,couponController.couponLoad)
admin_Routes.get("/admin/coupon/add",adminAuth.isLogin,couponController.addCoupon)
admin_Routes.post("/admin/coupon/add",adminAuth.isLogin,couponController.insertCoupon)
admin_Routes.get("/admin/coupon/edit/:id",adminAuth.isLogin,couponController.couponEditLoad)
admin_Routes.post("/admin/coupon/update/:id",adminAuth.isLogin,couponController.couponUpdate)
admin_Routes.get("/admin/coupon/delete/:id",adminAuth.isLogin,couponController.couponDelete)
admin_Routes.get("/admin/coupon/undelete/:id",adminAuth.isLogin,couponController.couponUndelete)

admin_Routes.get("/admin/return",returnController.returnLoad)

admin_Routes.get("/returnaccept/:id",returnController.accept)
admin_Routes.get("/returndeny/:id",returnController.reject)

admin_Routes.get('/admin/logout',adminController.adminLogout);








module.exports=admin_Routes

