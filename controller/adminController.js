const collection = require("../model/userdb");
const productcollection=require('../model/productdb');
const categorycollection = require("../model/categorydb");
const couponCollection=require("../model/coupondb")
const sharp=require('sharp')
const dotenv=require('dotenv').config();



const adminLog=async(req,res)=>{
    if(req.session.admin){
        const userCount = await collection.countDocuments();
        const users=await collection.find()
    
        const orderCount = await collection.aggregate([
            { $unwind: '$orders' },
            { $group: { _id: null, totalOrders: { $sum: 1 } } },
            { $project: { _id: 0, totalOrders: 1 } }
        ]);
        
        const [{ totalOrders }] = orderCount;
        
        console.log("Total number of orders:", totalOrders);
        
        
        const startOfWeek = new Date();
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        
        const endOfWeek = new Date();
        endOfWeek.setHours(23, 59, 59, 999);
        endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
        
        const dayCounts = await collection.aggregate([
            { $unwind: '$orders' },
            {
                $match: {
                    'orders.orderDate': {
                        $gte: startOfWeek,
                        $lte: endOfWeek
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$orders.orderDate" } },
                    totalOrders: { $sum: 1 }
                }
            },
            { $project: { _id: 0, date: '$_id', totalOrders: 1 } }
        ]);
        
        console.log('day', dayCounts);

        const currentYear = new Date().getFullYear();
       
        const monthlyCounts = await collection.aggregate([
            { $unwind: '$orders' },
            {
                $match: {
                    'orders.orderDate': {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lt: new Date(`${currentYear + 1}-01-01`)
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$orders.orderDate" } },
                    totalOrders: { $sum: 1 }
                }
            },
            { $project: { _id: 0, month: '$_id', totalOrders: 1 } }
        ]);
        console.log('month', monthlyCounts);

        const yearlyCount = await collection.aggregate([
            { $unwind: '$orders' },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y", date: "$orders.orderDate" } },
                    totalOrders: { $sum: 1 }
                }
            },
            { $project: { _id: 0, year: '$_id', totalOrders: 1 } }
        ]);
        console.log('yearly', yearlyCount);

        const totalSales=await collection.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalPrice" }
                }
            }
        ])
        const [{ totalAmount }] = totalSales;

       
        res.render('index',{userCount,dayCounts,monthlyCounts,yearlyCount,totalAmount,totalOrders})
    }else{
        res.render('adminlogin')
    }
}


const adminHome=async(req,res)=>{

    if(req.body.email==process.env.adEmail&&req.body.password==process.env.adPassword){
        req.session.admin=req.body.email
        res.redirect('/admin')
    }else{
        res.render('adminlogin',{error:'Invalid Credential'})
    } 
}

const usersLoad=async(req,res)=>{
    const users = await collection.find()
    res.render('users',{users})
}



const userBlock = async (req, res) => {
    try {
      const id = req.params.id;
      const user = await collection.findByIdAndUpdate(id, { blocked: true });
  
      if (!user) {
        res.status(400).json({ error: 'User not found or could not be blocked' });
      }
     
      res.redirect('/admin/users');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const userUnblock = async (req, res) => {
    try {
      const id = req.params.id;
      const user = await collection.findByIdAndUpdate(id, { blocked: false });
  
      if (!user) {
        res.status(400).json({ error: 'User not found or could not be unblocked' });
      } 
      res.redirect('/admin/users');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };








const productsLoad = async (req, res) => {
    const page = parseInt(req.query.page) || 1; 
    const perPage = 4; 

    try {
        const totalProducts = await productcollection.countDocuments(); 

        const products = await productcollection.find()
            .find()
            .skip((page - 1) * perPage) 
            .limit(perPage); 

        res.render('products', {
            products,
            currentPage: page,
            pages: Math.ceil(totalProducts / perPage) 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const addProduct=async(req,res)=>{
    try {
        const categories = await categorycollection.find({ isDeleted: false }); 
        
        let error = '';
        res.render('addproducts', { error, categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}


const insertProduct = async (req, res) => {
    try {
        const enteredProductName = req.body.name.toLowerCase();
        const categories = await categorycollection.find({ isDeleted: false }); 
       
        const existingProduct = await productcollection.findOne({
            name: { $regex: new RegExp('^' + enteredProductName + '$', 'i') }
        });

        if (existingProduct) {
            res.render('addproducts', { error: 'Product already exists',categories });
        } else {
            const price = Number(req.body.price);

            if (price > 0) {
                const productdata = {
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price,
                    category: req.body.category,
                    image:req.files.map(file=>file.filename),
                    stock: req.body.stock,
                    OfferPrice:req.body.offerprice,
                    Discount:req.body.discount,
                };
               
                await productcollection.insertMany([productdata]);
                res.redirect('/admin/products');
            } else {
                res.redirect('/admin/products/add');
            }
        }
    } catch (error) {
        console.log(error);
    }
};


const deleteProduct=async(req,res)=>{
    try{
        const id=req.params.id;
        const result= await productcollection.findByIdAndUpdate(id,{isDeleted: false });
        if(result){
            res.redirect('/admin/products')
        }else{
            console.log('product not found')
        }
    }catch(error){
        console.error('Error deleting user:',error)
    }
}

const undeleteProduct=async(req,res)=>{
    try{
        const id=req.params.id;
        const result= await productcollection.findByIdAndUpdate(id,{isDeleted: true });
        if(result){
            res.redirect('/admin/products')
        }else{
            console.log('product not found')
        }
    }catch(error){
        console.error('Error deleting user:',error)
    }
}

const editProduct=async(req,res)=>{
    let id = req.params.id;
    console.log('iddd:',id);
    const errorMessage=''
    productcollection.findById(id)
    .then(product=>{
        console.log('proid:',product._id)
        if(!product){
            res.redirect('/admin/products')
        }else{
            res.render('editproducts',{product,errorMessage})
        }
    })
    .catch(error =>{
        console.log("Error in finding the products : ", error);
        res.redirect('/admin/products')
    })
}

const updateProduct=async(req,res)=>{
    try{
        const enteredProductName = req.body.name.toLowerCase();
        let id = req.params.id;
        const result = await productcollection.findByIdAndUpdate(id, {
            name:req.body.name,
            description:req.body.description,
            price:req.body.price,
            category:req.body.category,
            image:req.files.map(file=>file.filename),
            stock:req.body.stock,
            

        })
        if(!result){
            console.log('not found')
        }else{
          res.redirect('/admin/products')  
        }
    }catch(err){
        console.log('Error updating the product : ',err);
        
    }
}

const categoryLoad=async(req,res)=>{
    try {
    const category=await categorycollection.find()
    res.render('category',{category})
} catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
}
}


const addcategory=async(req,res)=>{
    const error='';
    res.render('addcategory',{error})
}

const insertCategory=async(req,res)=>{
    try{
        const enteredCategory = req.body.category.toLowerCase();
        const existingCategory = await categorycollection.findOne({
            category: { $regex: new RegExp('^' + enteredCategory + '$', 'i') }
        });
        if (existingCategory) {
            
            res.render('addcategory', { error: 'Category already exists' });
        } else {
            const categorydata={
                category:req.body.category,
                description:req.body.description,
            }
            console.log(categorydata);
            await categorycollection.insertMany([categorydata]);
            res.redirect('/admin/category');
        }
    }catch(error){
        console.log(error)
    }
    
}


const editCategory=async(req,res)=>{
    let id=req.params.id;
    categorycollection.findById(id)
    .then(category=>{
        if(!category){
            res.redirect('/admin/category')
        }else{
            res.render('editcategory',{category:category})
        }
    })
    .catch(error =>{
        console.log("Error in finding the Category : ", error);
        res.redirect('/admin/category')
    })
}

const updateCategory=async(req,res)=>{
    try{
    let id=req.params.id;
    const result=await categorycollection.findByIdAndUpdate(id,{
        category:req.body.category,
        description:req.body.description
    })
    if(!result){
        console.log('not found')
    }else{
      res.redirect('/admin/category')  
    }
}catch(err){
    console.log('Error updating the categorry : ',err);
}
}


const deletecategory=async(req,res)=>{
    try{
        const id=req.params.id;
        const result= await categorycollection.findByIdAndUpdate(id,{ isDeleted: false });
        if(result){
            res.redirect('/admin/category')
        }else{
            console.log('product not found')
        }
    }catch(error){
        console.error('Error deleting category:',error)
    }
}

const undeletecategory=async(req,res)=>{
    try{
        const id=req.params.id;
        const result= await categorycollection.findByIdAndUpdate(id,{ isDeleted: true });
        if(result){
            res.redirect('/admin/category')
        }else{
            console.log('product not found')
        }
    }catch(error){
        console.error('Error deleting category:',error)
    }
}

const ordersLoad=async(req,res)=>{
    const page=parseInt(req.query.page) || 1;
    const perPage = 4;
    try {
        const totalOrders = await collection.countDocuments({ orders: { $exists: true, $ne: [] } })
        const users = await collection.find({ orders: { $exists: true, $ne: [] } }).sort({ 'orders.orderDate': -1 }).skip((page - 1) * perPage).limit(perPage).populate('orders.product')
        const address=await addressCollection.find({})
        console.log('add:',address);
        res.render('orders', { users:users,address:address,currentPage: page, pages: Math.ceil(totalOrders / perPage) });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
 
}

const updateOrderStatus=async(req,res)=>{
    const orderId = req.params.orderId;
    const newStatus = req.params.newStatus;
    
    try{
        const order=await collection.findOneAndUpdate(
            {'orders._id':orderId},
            {$set:{ 'orders.$.status':newStatus}},
           {new:true}
           
        )
        console.log('oo',order)
            res.redirect('/admin/orders')

    }catch(error){
        console.error('Error loading :', error);
        res.status(500).send('Internal Server Error');
      }

}



const excel = require('exceljs'); 
const stream = require('stream'); 
const addressCollection = require("../model/addressdb");

const excelsheet = async (req, res) => {
  try {
    const startDate =new Date( req.query.startDate);
    const endDate =new Date( req.query.endDate);

    const usersWithOrders = await collection.find({
        'orders': {
          $exists: true,
        //   $not: { $size: 0 },
        //   $elemMatch: {
        //     'orderDate': { $gte: startDate, $lte: endDate }
        //   }
        }
      });
      const add= await addressCollection.find({})
      console.log('addr:',add);
     


    if (!usersWithOrders) {
      return res.status(404).send("No orders found");
    }

    // Create a new Excel workbook and worksheet
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Orders");

    
    worksheet.columns = [
      { header: "Order ID", key: "id", width: 12 },
      { header: "Customer Name", key: "customerName", width: 20 },
      { header: "Delivery Address", key: "deliveryAddress", width: 30 },
      { header: "Mobile Number", key: "mobileNumber", width: 15 },
      { header: "Total Amount", key: "totalAmount", width: 15 },
      { header: "Payment Mode", key: "paymentMode", width: 20 },
      { header: "Order Status", key: "orderStatus", width: 15 },
      { header: "Order Date", key: "orderDate", width: 20 },
      { header: "Item Details", key: "itemDetails", width: 50 }, 
      
    ];

    usersWithOrders.forEach((order) => {
        
        order.orders.forEach((singleOrder) => {
            
          const itemDetails = singleOrder.productName + `, Quantity: ${singleOrder.quantity}`;
      
          worksheet.addRow({
            id: order._id,
            customerName: order.name,
            deliveryAddress: order.address[0].houseName + ', ' + order.address[0].street + ', ' + order.address[0].city,
            mobileNumber: order.phone,
            totalAmount: order.totalPrice,
            paymentMode: singleOrder.paymentmethod || '',
            orderStatus: singleOrder.status || '',
            orderDate: singleOrder.orderDate ? singleOrder.orderDate.toISOString().split('T')[0] : '',
            itemDetails,
          });
        });
      });
    
    const streamifier = new stream.PassThrough();

    // Pipe the Excel workbook to the stream
    await workbook.xlsx.write(streamifier);

    // Set response headers for Excel file download
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=orders.xlsx");

    
    streamifier.pipe(res);
  } catch (error) {
    console.error("Error due to excel:", error);
    res.status(500).send("Error due to excel");
  }
};


const couponLoad=async (req,res)=>{
    try{
        const coupons = await couponCollection.find({})
    return res.render("coupon", { coupons })
        
    }catch(error){
        console.error("Error due to render coupon:", error);
    res.status(500).send("Error due to coupon");
    }
} 

const addCoupon=async(req,res)=>{
    try{

        res.render('addcoupon')

    }catch(error){
        console.log("Error due to add Coupon: ",error);
        res.status(500).send("Error due to add Coupon");
    }
}


const insertCoupon=async(req,res)=>{
    let data={
        couponName:req.body.couponName,
        couponCode:req.body.couponCode,
        discountAmount:req.body.discountAmount,
        expirationDate: req.body.expirationDate,
        description:req.body.description,
    }
    try{
        const result=await couponCollection.insertMany([data]);
        if(!result){
            res.status(400).send("Coupon not added");
            }
            res.redirect('/admin/coupon')
    }catch(error){
        console.log("Error due to Insert Coupon: ",error);
        res.status(500).send("Error due to Add Coupon");
    }
}

const couponEditLoad=async(req,res)=>{
    try{
        const result=await couponCollection.findOne({_id:req.params.id})
        if(!result){
            res.status(400).send("Coupon not found");
            }
            console.log('res:',result);
            res.render('editcoupon',{result})
    }catch(error){
        console.log("Error due to Edit Coupon: ",error);
        res.status(500).send("Error due to Edit Coupon");
    }
}

const couponUpdate=async(req,res)=>{
    try{
        let id=req.params.id;
        const result=await couponCollection.findByIdAndUpdate(id,{
            couponName:req.body.couponName,
        couponCode:req.body.couponCode,
        discountAmount:req.body.discountAmount,
        expirationDate: req.body.expirationDate,
        description:req.body.description,
        })
        if(!result){
            console.log('not found')
        }else{
            res.redirect('/admin/coupon')
        }

    }catch(error){
        console.log("Error due to Update Coupon: ",error);
        res.status(500).send("Error due to Update Coupon");
    }
}

const couponDelete=async(req,res)=>{
    try{
        const id=req.params.id;
        const result= await couponCollection.findByIdAndUpdate(id,{ isDeleted: false });
        if(!result){
            console.log('not found')
        }else{
            res.redirect('/admin/coupon');
        }

    }catch(error){
        console.log("Error due to Delete Coupon: ",error);
        res.status(500).send("Error due to Delete Coupon");
    }
}


const couponUndelete=async(req,res)=>{
    try{
        const id=req.params.id;
        const result= await couponCollection.findByIdAndUpdate(id,{ isDeleted: true });
        if(!result){
            console.log('not found')
            }else{
                res.redirect('/admin/coupon');
                }
    }catch(error){
        console.log("Error due to unDelete Coupon: ",error);
        res.status(500).send("Error due to unDelete Coupon");
    }
}

const adminLogout=async(req,res)=>{
    req.session.destroy(function (err) {
        if (err) {
          console.log(err);
          res.redirect("/admin")
        } else {
          console.log("logout successful");
          res.status(200)
          res.redirect('/admin')
        }
      });
}






module.exports={
    adminLog,
    adminHome,
    usersLoad,
    categoryLoad,
    productsLoad,
    addProduct,
    insertProduct,
    deleteProduct,undeleteProduct,
    editProduct,
    updateProduct,
    adminLogout,
    insertCategory,
    addcategory,
    editCategory,
    updateCategory,
    deletecategory,undeletecategory,
    userBlock,
    userUnblock,
    ordersLoad,
    updateOrderStatus,excelsheet,
    couponLoad,addCoupon,insertCoupon
    ,couponEditLoad,couponUpdate,
    couponDelete,couponUndelete
    
}