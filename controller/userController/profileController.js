const collection=require('../../model/userdb')
const nodemailer=require("nodemailer");
const generateOtp=require("generate-otp");
const productcollection = require('../../model/productdb');
const addressCollection=require('../../model/addressdb')
const couponCollection=require('../../model/coupondb')
const walletcollection=require("../../model/walletdb")
const returnCollection=require("../../model/returndb")
const wishlistcollection=require("../../model/wishlistdb")
const referralcollection=require("../../model/referraldb")
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const bodyParser=require('body-parser');
const nodemon = require('nodemon');
const easyinvoice=require('easyinvoice')
const fs=require('fs');
const { clear } = require('console');





const profileLoad=async(req,res)=>{
    const session=req.session.user
    const user = await collection.findOne({email:session})
    const walletDetails = await walletcollection.findOne({ customerid: user._id })
    const walletAmount = walletDetails ? walletDetails.Amount : 0;
    res.render('profile',{user, walletAmount })
}

const addaddressLoad=async(req,res)=>{
    const id=req.session.user;
   
    const user = await collection.findOne({email:id})
    console.log('user:',user)
    res.render('addaddress',{user})
}



const updateAddress = async (req, res) => {
    const id = req.session.user;
    const newAddress = {
        houseName: req.body.houseName,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        country: req.body.country,
    };

    try {
        const user = await collection.findOne({ email: id });
        if (user) {
            await collection.updateOne(
                { email: id },
                { $push: { address: newAddress } }
            );
            console.log('Address added successfully');
            res.redirect('/user/profile');
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error adding address');
    }
};

const editAddress=async (req,res)=>{
    const id=req.params.id;
    collection.findById(id)
    .then(user=>{
        if(!user){
            res.redirect('/user/profile')
        }else{
            res.render('editaddress',{user})
        }
    })
    .catch(error =>{
        console.log("Error in finding the address : ", error);
        res.redirect('/user/profile')
    })

}

const addressUpdate=async(req,res)=>{
   
   try{
    const id={_id:req.params.id};
    
    newAddress={
        address:[{
            houseName: req.body.houseName,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        country: req.body.country,
        }]
    }
    const option={upsert:true};
    console.log(newAddress)
    await collection.updateOne(id,newAddress,option)
    res.redirect("/user/profile")
   }
   catch(error){
    console.log("address data error")
  }  
    }
 


const editProfile=async(req,res)=>{
    const id=req.params.id;
    collection.findById(id)
    .then(user=>{
        if(!user){
            res.redirect('/user/profile')
        }else{
            res.render('editprofile',{user})
        }
    })
    .catch(error =>{
        console.log("Error in finding the user : ", error);
        res.redirect('/admin/profile')
    })
}

const updateProfile=async(req,res)=>{
    try{
        let id=req.params.id;
        const result = await collection.findByIdAndUpdate(id, {
            name:req.body.name,
            email:req.body.email,
            phone:req.body.phone
        })
        if(!result){
            console.log('not found')
        }else{
          res.redirect('/user/profile')  
        }
        

    }catch(err){
        console.log('Error updating the product : ',err);
        
    }
}

const walletLoad=async(req,res)=>{
    try {
        const userId = req.session.user;
       const user=await collection.findOne({email:userId}) 
        const wallet = await walletcollection.findOne({customerid: user._id });

        if (wallet) {
            const walletBalance = wallet.Amount;

            const transactions = wallet.transactions;

            res.render('wallet', { walletBalance, transactions });
        } else {
            res.render('wallet', { walletBalance: 0, transactions: [] }); 
        }
    } catch (error) {
        console.error('Error while fetching wallet balance and transactions:', error);
        res.status(500).send('Internal server error');
    }

}

const resetLoad=async(req,res)=>{
    const error=''
    res.render('resetpassword',{error})
}

const resetCheck=async(req,res)=>{
    const useremail=req.session.user
    const user=await collection.findOne({email:useremail})
   
    if (req.body.currentpassword === user.password){

        await collection.findByIdAndUpdate(user._id, { password: req.body.newpassword });
        const successMessage = 'Your password has been reset successfully.';
        const error=''
        res.render('resetpassword', { successMessage,error });

    }else{
        const error='Current password do not match'
        res.render('resetpassword',{error})
    }
}

const invoice = async (req, res) => {
    const orderId = req.params.id;
    const userId = req.session.user;
    
    try {
        const user = await collection.findOne({ email: userId });
        const orderDetails = await collection.findOne({ 'orders._id': orderId }).populate('orders.product');
  
        const order = orderDetails.orders.find(order => order._id == orderId);
        

        // Assuming 'order.product' is a single product
        const product = order.product;
        console.log('product:', product);
        const quantity = order.quantity;

        const products = [{
            quantity: quantity,
            description: product.name,
            "tax-rate": 0,
            price: product.price,
        }];

        // Calculate the total price as the sum of all product prices
        const totalPrice = products.reduce((total, product) => {
            return total + product.price * product.quantity;
        }, 0);

        const logoUrl =  "https://watchbox-sfcc.imgix.net/og/watchbox-og-full.png"
        const invoiceData = {
            currency: 'INR',
            marginTop: 25,
            marginRight: 25,
            marginLeft: 25,
            marginBottom: 25,
            logo: logoUrl,
            sender: {
                company: 'WatchBox',
                address: 'Dotspace Trivandrum',
                zip: '695411',
                city: 'Trivandrum',
                country: 'India',
            },
            client: {
                company: user.name,
                address: `${user.address[0].houseName}, ${user.address[0].street}, ${user.address[0].city}, ${user.address[0].state} - ${user.address[0].pincode}, ${user.address[0].country}`
            },
            
            information: {
                date: new Date().toLocaleDateString(),
                number: `INV_${order._id}`,
            },
            products: products,
            "bottom-notice": `Thank you for choosing WatchBox! We appreciate your business
            If you have any questions or concerns regarding this invoice,
            please contact our customer support at support@watchbox.com.
            Your satisfaction is our priority. Hope to see you again!`
        };

        // Create invoice
        easyinvoice.createInvoice(invoiceData, function (result) {
            // Send the PDF as a response for download
            res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.pdf`);
            res.setHeader('Content-Type', 'application/pdf');
            res.send(Buffer.from(result.pdf, 'base64'));
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating the invoice.');
    }
};



const ordersLoad=async(req,res)=>{
    try{
        const userId = req.session.user; 
        const user = await collection.findOne({ email: userId }).populate('orders.product').sort({ 'orders.orderDate': -1 });
      
        res.render('orderdetails',{orderItems:user.orders,user})

    }catch (error) {
        console.error('Error loading cart:', error);
        res.status(500).send('Internal Server Error');
      }
}

const viewMore=async(req,res)=>{
    try{
        const orderId=req.params.id
        const userId = req.session.user; 
        const user = await collection.findOne({ email: userId });
        const orderDetails = await collection.findOne({'orders._id':orderId }).populate('orders.product');
        const order = orderDetails.orders.find(order => order._id == orderId);
        const address=await addressCollection.find({})



        res.render('viewmore',{item:order,user,address:address})
    }catch(error){
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}

const cancelOrder=async(req,res)=>{
    try{
        const orderId = req.params.id;
        const userId = req.session.user;
        const user=await collection.findOne({email:userId}).populate('orders.product');
        const orderDetails=await collection.findOne({'orders._id':orderId}).populate('orders.product')
        const order = orderDetails.orders.find(order => order._id == orderId);
       
        if (order.paymentmethod === 'Online Payment'|| order.paymentmethod==='Wallet' && (order.status === 'Pending' || order.status === 'Shipped' || order.status === 'Out for Delivery')) {
            const wallet = await walletcollection.findOneAndUpdate(
                { customerid: user._id },
                { $inc: {Amount: (order.totalPrice+50)},
                $push:{
                    transactions:{
                        type:'Refund',
                        amount:(order.totalPrice+50),
                    },
                },
            },
                { new: true }
            )
        };

        for (const order of user.orders) {
            const product = order.product;
            const orderedQuantity = order.quantity;
            product.stock += orderedQuantity;
            await product.save();
        }
               
        
        const updateorder = await collection.findOneAndUpdate(
            { 'orders._id': orderId }, 
            { $set: {'orders.$.status': 'Cancelled' } }, 
            { new: true } 
        );
       
        res.redirect('/user/orders')
        

    }catch (error) {
        console.error('Error loading :', error);
        res.status(500).send('Internal Server Error');
      }
}

const returnOrder=async(req,res)=>{
    try{

        console.log('sel',req.body)

        const orderId = req.params.id;
        const userId = req.session.user;
        const user=await collection.findOne({email:userId}).populate('orders.product');
        const orderDetails=await collection.findOne({'orders._id':orderId}).populate('orders.product')
        const order = orderDetails.orders.find(order => order._id == orderId);
        // if ((order.paymentmethod === 'Online Payment' || order.paymentmethod === 'Cash On Delivery'|| order.paymentmethod==='wallet') && order.status === 'Delivered') {
        //     const wallet = await walletcollection.findOneAndUpdate(
        //         { customerid: user._id },
        //         { $inc: {Amount: (order.totalPrice+50) },
        //         $push:{
        //             transactions:{
        //                 type:'Refund',
        //                 amount:(order.totalPrice+50),
        //             },
        //         },
            
        //     },
        //         { new: true }
        //     ) 
        // }
        
        
    //     if (req.body.returnReason !== "Product Defect or Damage") {
    //     for (const order of user.orders) {
    //         const product = order.product;
    //         const orderedQuantity = order.quantity;
    //         product.stock += orderedQuantity;
    //         await product.save();
    //     }
    // } else {
    //     console.log("Return reason is Product Defect or Damage");
    // }

        const updateorder = await collection.findOneAndUpdate(
            { 'orders._id': orderId }, 
            { $set: {'orders.$.status': 'Returned'}}, 
            { new: true } 
        );

        
            const returnOrderDetails = new returnCollection({
                userId: userId,
                orderId: orderId,
                product: order.product._id,
                quantity: order.quantity,
                reason: req.body.returnReason, 
                feedback: req.body.feedback, 
                status: 'Returned', 
                date: new Date(),
            });
            await returnOrderDetails.save();
       
        res.redirect('/user/orders')

    }catch(error){
        console.log("Error",error)
    }
}


module.exports={
    cancelOrder,returnOrder,viewMore,
    profileLoad,resetLoad,walletLoad,invoice,
    addaddressLoad,updateAddress,editAddress
    ,addressUpdate,editProfile,updateProfile,resetCheck,ordersLoad,
}