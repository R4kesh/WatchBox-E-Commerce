const express=require('express')
const admin_Routes=express()
const path =require('path')
const session=require('express-session')
const adminController=require('../controller/adminController')

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
const upload=multer({storage:storage}).single('image');


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

admin_Routes.get('/admin/users',adminController.usersLoad)

admin_Routes.post('/admin/block/:id',adminController.userBlock)
admin_Routes.post('/admin/unblock/:id',adminController.userUnblock)



admin_Routes.get('/admin/category',adminController.categoryLoad)
admin_Routes.get('/admin/category',adminController.categoryLoad)
admin_Routes.get('/admin/category/add',adminController.addcategory)
admin_Routes.post('/admin/category/add',adminController.insertCategory)




admin_Routes.get('/admin/products',adminController.productsLoad)
admin_Routes.get('/admin/products/add',adminController.addProduct)
admin_Routes.post('/admin/products/add',upload,adminController.insertProduct)

admin_Routes.get('/admin/products/delete/:id',adminController.deleteProduct)
admin_Routes.get('/admin/products/edit/:id',adminController.editProduct)
admin_Routes.post('/admin/products/update/:id',upload,adminController.updateProduct)

admin_Routes.get('/admin/category/delete/:id',adminController.deletecategory)
admin_Routes.get('/admin/category/edit/:id',adminController.editCategory)
admin_Routes.post('/admin/category/update/:id',adminController.updateCategory)

admin_Routes.get('/admin/orders',adminController.ordersLoad)
admin_Routes.get('/updateOrderStatus/:userId/:orderId/:newStatus',adminController.updateOrderStatus)

admin_Routes.get('/admin/logout',adminController.adminLogout);








module.exports=admin_Routes

