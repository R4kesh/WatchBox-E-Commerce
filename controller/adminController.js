const userCollection = require("../model/userdb");
const productcollection=require('../model/productdb');
const categorycollection = require("../model/categorydb");
const couponCollection=require("../model/coupondb")
const dotenv=require('dotenv').config();



const adminLog=async(req,res)=>{
    try{

        if(req.session.admin){
        const userCount = await userCollection.countDocuments();
        const users=await userCollection.find()
        const categorySalesData = await userCollection.aggregate([
          {
              $unwind: '$orders',
          },
          {
              $lookup: {
                  from: 'products',
                  localField: 'orders.product',
                  foreignField: '_id',
                  as: 'productInfo',
              },
          },
          {
              $unwind: '$productInfo',
          },
          {
              $group: {
                  _id: '$productInfo.category',
                  totalOrders: { $sum: 1 },
              },
          },
          {
              $project: {
                  category: '$_id',
                  totalOrders: 1,
                  _id: 0,
              },
          },
      ]);
        const orderCount = await userCollection.aggregate([
            { $unwind: '$orders' },
            { $group: { _id: null, totalOrders: { $sum: 1 } } },
            { $project: { _id: 0, totalOrders: 1 } }
        ]);
        

        const [{ totalOrders }] = orderCount;
        const startOfWeek = new Date();
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date();
        endOfWeek.setHours(23, 59, 59, 999);
        endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
        
        const dayCounts = await userCollection.aggregate([
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
       
        const currentYear = new Date().getFullYear();
       
        const monthlyCounts = await userCollection.aggregate([
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


        const yearlyCount = await userCollection.aggregate([
            { $unwind: '$orders' },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y", date: "$orders.orderDate" } },
                    totalOrders: { $sum: 1 }
                }
            },
            { $project: { _id: 0, year: '$_id', totalOrders: 1 } }
        ]);

        const totalSales=await userCollection.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalPrice" }
                }
            }
        ])
        const [{ totalAmount }] = totalSales;

        res.render('index',{userCount,dayCounts,monthlyCounts,yearlyCount,totalAmount,totalOrders,categorySalesData})
    }else{
        res.render('adminlogin')
    }
    }catch(error){
        console.log("Error in Index Route")
        throw error;
    }
    
}


const adminHome=async(req,res)=>{
    try{

    if(req.body.email==process.env.ADEMAIL&&req.body.password==process.env.ADPASSWORD){
        req.session.admin=req.body.email
        res.redirect('/admin')
    }else{
        res.render('adminlogin',{error:'Invalid Credential'})
    } 
}catch(error){
    console.log("Error In Admin Login Page");
    throw error;
    
}
}

const usersLoad=async(req,res)=>{
    try{

    const users = await userCollection.find()
    res.render('users',{users})
}catch(error){
    console.log("Error In Users Load Page");
    throw error;
}
}



const userBlock = async (req, res) => {
    try {
      const id = req.params.id;
      const user = await userCollection.findByIdAndUpdate(id, { blocked: true });
  
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
      const user = await userCollection.findByIdAndUpdate(id, { blocked: false });
  
      if (!user) {
        res.status(400).json({ error: 'User not found or could not be unblocked' });
      } 
      res.redirect('/admin/users');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


const ordersLoad=async(req,res)=>{
    const page=parseInt(req.query.page) || 1;
    const perPage = 2;
    try {
        const totalOrders = await userCollection.countDocuments({ orders: { $exists: true, $ne: [] } })
        const users = await userCollection.find({ orders: { $exists: true, $ne: [] } }).sort({ 'orders.orderDate': -1 }).skip((page - 1) * perPage).limit(perPage).populate('orders.product')
        const address=await addressCollection.find({})
        res.render('orders', { users:users,address:address,currentPage: page, pages: Math.ceil(totalOrders / perPage) });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
 
}


const viewmore=async(req,res)=>{
    try{
        const orderId=req.params.id;
        const userId = req.params.user; 
        const user = await userCollection.findOne({_id: userId});
        const orderDetails = await userCollection.findOne({'orders._id':orderId }).populate('orders.product');
        const order = orderDetails.orders.find(order => order._id == orderId);
        const address=await addressCollection.find({})

        res.render('orderdetails',{item:order,user,address:address})
    }catch(error){
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}

const updateOrderStatus=async(req,res)=>{
    const orderId = req.params.orderId;
    const newStatus = req.params.newStatus;
    
    try{
        const order=await userCollection.findOneAndUpdate(
            {'orders._id':orderId},
            {$set:{ 'orders.$.status':newStatus}},
           {new:true}
           
        )
            res.redirect('/admin/orders')

    }catch(error){
        console.error('Error loading :', error);
        res.status(500).send('Internal Server Error');
      }

}



const excel = require('exceljs'); 
const stream = require('stream'); 
const addressCollection = require("../model/addressdb");
const session = require("express-session");

const excelsheet = async (req, res) => {
  try {
    const startDate =new Date( req.query.startDate);
    const endDate =new Date( req.query.endDate);

    const usersWithOrders = await userCollection.find({
        'orders': {
          $exists: true,
        //   $not: { $size: 0 },
        //   $elemMatch: {
        //     'orderDate': { $gte: startDate, $lte: endDate }
        //   }
        }
      }).populate('orders.product')
      const add= await addressCollection.find({})
     
     


    if (!usersWithOrders) {
      return res.status(404).send("No orders found");
    }

   
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
            
          const itemDetails = singleOrder.product.name + `, Quantity: ${singleOrder.quantity}`;
          const deliveryAddress = order.address && order.address.length > 0
          ? order.address[0].houseName + ', ' + order.address[0].street +','+ order.address[0].city
          :'N/A';
          worksheet.addRow({
            id: order._id,
            customerName: order.name,
            deliveryAddress,
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

    
    await workbook.xlsx.write(streamifier);

   
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=orders.xlsx");

    
    streamifier.pipe(res);
  } catch (error) {
    console.error("Error due to excel:", error);
    res.status(500).send("Error due to excel");
  }
};



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
    adminLogout,
    userBlock,
    userUnblock,
    ordersLoad,
    viewmore,
    updateOrderStatus,excelsheet,  
}