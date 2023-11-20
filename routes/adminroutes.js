const express=require('express')
const admin_Routes=express()
const path =require('path')
const session=require('express-session')
const adminController=require('../controller/adminController')
const adminAuth=require('../middleware/adminAuth')

const productcollection=require('../model/productdb')

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



admin_Routes.get('/admin/category',adminAuth.isLogin,adminController.categoryLoad)

admin_Routes.get('/admin/category/add',adminAuth.isLogin,adminController.addcategory)
admin_Routes.post('/admin/category/add',adminAuth.isLogin,adminController.insertCategory)




admin_Routes.get('/admin/products',adminAuth.isLogin,adminController.productsLoad)
admin_Routes.get('/admin/products/add',adminAuth.isLogin,adminController.addProduct)
admin_Routes.post('/admin/Products/add',adminAuth.isLogin,upload,adminController.insertProduct)

admin_Routes.get('/admin/products/delete/:id',adminAuth.isLogin,adminController.deleteProduct)
admin_Routes.get('/admin/products/undelete/:id',adminAuth.isLogin,adminController.undeleteProduct)
admin_Routes.get('/admin/products/edit/:id',adminAuth.isLogin,adminController.editProduct)
admin_Routes.post('/admin/products/update/:id',adminAuth.isLogin,upload,adminController.updateProduct)

admin_Routes.get('/admin/category/delete/:id',adminAuth.isLogin,adminController.deletecategory)
admin_Routes.get('/admin/category/undelete/:id',adminAuth.isLogin,adminController.undeletecategory)

admin_Routes.get('/admin/category/edit/:id',adminAuth.isLogin,adminController.editCategory)
admin_Routes.post('/admin/category/update/:id',adminAuth.isLogin,adminController.updateCategory)

admin_Routes.get('/admin/orders',adminAuth.isLogin,adminController.ordersLoad)
admin_Routes.get('/updateOrderStatus/:userId/:orderId/:newStatus',adminAuth.isLogin,adminController.updateOrderStatus)

admin_Routes.get("/exportOrdersToExcel", adminController.excelsheet)

admin_Routes.get('/admin/logout',adminController.adminLogout);








module.exports=admin_Routes

