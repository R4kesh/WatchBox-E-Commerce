const collection=require('../model/userdb')
const nodemailer=require("nodemailer");
const generateOtp=require("generate-otp");
const productcollection = require('../model/productdb');
const addressCollection=require('../model/addressdb')
const couponCollection=require('../model/coupondb')
const walletcollection=require("../model/walletdb")
const wishlistcollection=require("../model/wishlistdb")
const referralcollection=require("../model/referraldb")
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const bodyParser=require('body-parser');
const nodemon = require('nodemon');
const easyinvoice=require('easyinvoice')
const fs=require('fs');
const { clear } = require('console');




const loginLoad=async(req,res)=>{
    const error=''
    if(req.session.user){
      res.redirect('/')  
    }
    else{
        res.render('login',{error})
    }
}

const signupLoad=async(req,res)=>{
    const message='';
    const message1=''
    if(req.session.user){
        res.redirect('/')
    }
    else{
        res.render('signup',{message,message1})
    }
}


const PAGE_SIZE = 4;
const homeLoad = async (req, res) => {
    try {
        
            const currentPage = parseInt(req.query.page) || 1;
            const skip = (currentPage - 1) * PAGE_SIZE;

            const products = await productcollection
                .find({ isDeleted: false })
                .skip(skip)
                .limit(PAGE_SIZE)
                .exec(); // Use .exec() to execute the query

                    
            const users = await collection.findOne({ email: req.session.user });
            const wallet = await walletcollection.findOne({ customerid: users._id });
        if (!wallet) {
            const newwallet = new walletcollection({
                customerid: users._id ,
            });
           
            await newwallet.save();
        }

            res.render('home', { products, users, currentPage });
       
          
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
const PAGESIZE = 8;
const productsLoad= async (req, res) => {
    try {
        
            const currentPage = parseInt(req.query.page) || 1;
            const skip = (currentPage - 1) * PAGESIZE;

            const products = await productcollection
                .find()
                .skip(skip)
                .limit(PAGESIZE)
                .exec(); // Use .exec() to execute the query

            const users = await collection.findOne({ email: req.session.user });

            res.render('products', { products, users, currentPage });
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

};

const forgotLoad=async(req,res)=>{
    let error=''
    res.render('forgot',{error})
}

const verifyEmail=async(req,res)=>{
    
    try{
        const userremail=await collection.findOne({email:req.body.email})

        if(userremail){
            
     otp=generateOtp.generate(4,{digits:true,alphabets:false,specialChars:false})

    transporter=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user: 'testtdemoo11111@gmail.com',
              pass: 'wikvaxsgqyebphvh',
        },
    })
    const mailOptions={
        from:"rakeshsrks2580@gmail.com",
        to:"rakeshsrks2580@gmail.com",
        subject:"Your Otp code",
        text:`your otp code is:${otp}`
    }
    transporter.sendMail(mailOptions,(error,info) =>{
        if(error){
            console.error("error sending otp",error)

        }
        else{
            console.log("otp send:",info.response);
        }

    })
    console.log("send successfully");
    let errorMessage=''
    res.render('forgototp',{errorMessage,user:userremail._id})


        }else{
            let error='Email not match'
            res.render('forgot',{error})
        }

    }catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const forgototpverify=async(req,res)=>{
    try{
        const id=req.params.id
        const user=await collection.findById(id)
        
        const enterOtp=req.body.otp;
        console.log(enterOtp)
        if(otp===enterOtp){
            
        
        res.render("newpassword",{userr:user._id})
        }
        else{
            res.render("forgototp",{ errorMessage: 'Invalid OTP. Please try again.' })
        }
    }
    catch(error){
        console.error(error);
        res.status(500).send("internal server error")
    }


}

const setnewpassword=async(req,res)=>{
    try{
        const newPassword = req.body.password;
        const id=req.params.id;
        const user=await collection.findById(id)
      
        console.log('uu',user)


        await collection.findByIdAndUpdate(id, { password:newPassword });

        res.redirect('/login')

    }catch(error){
        console.error(error);
        res.status(500).send("internal server error")
    }
}


const verifyLogin=async(req,res)=>{
    try{
    const error='';
    const check=await collection.findOne({email:req.body.email})
    if(check){
if(check.password===req.body.password&&check.blocked===false){
req.session.user=req.body.email

res.redirect("/")
}
else{
    res.render("login",{ error: "Invalid password" })

} 
} else {
    // Email not found in the database
    res.render("login", { error: "Email not found" });
}
}
    catch(error){
        console.error(error);
        res.status(500).send("internal server error")
    }

}


const insertUser=async(req,res)=>{
    function generateReferralCode(name) {
        return Math.random().toString(36).substr(2, 8).toUpperCase();
      }
      const referralCode = generateReferralCode(req.body.name);
    
    const data={
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        password:req.body.password,
        referral:referralCode,
    }

    

    const refcheck=await collection.findOne({referral:req.body.referralCode})
    console.log('nu',refcheck);
    const check=await collection.findOne({email:req.body.email})
    const message='Email Already Exist'

    if(check){
        res.render('signup',{message})
    }else if(!refcheck){
        const message1='referral Code Not Found'
        res.render('signup',{message1})
    }else{
        
    await collection.insertMany([data])

    const id=await collection.findOne({referral:referralCode})
    if (id) {
        const newReferraldetail = new referralcollection({
             userId: id._id,
             code: id.referral,
              });

         await newReferraldetail.save();
         console.log("Referral code created successfully");
     } else {
         console.log("User not found for referral code creation.");
     }

      let refferaluser=await collection.findOne({referral:req.body.referralCode})
      let referreduser = await walletcollection.findOneAndUpdate(
        {customerid:refferaluser._id},
        {
          $inc: {
            Amount: 100,
          },
        }
      );
       

    otp=generateOtp.generate(4,{digits:true,alphabets:false,specialChars:false})

    transporter=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user: 'testtdemoo11111@gmail.com',
              pass: 'wikvaxsgqyebphvh',
        },
    })
    const mailOptions={
        from:"rakeshsrks2580@gmail.com",
        to:"rakeshsrks2580@gmail.com",
        subject:"Your Otp code",
        text:`your otp code is:${otp}`
    }
    transporter.sendMail(mailOptions,(error,info) =>{
        if(error){
            console.error("error sending otp",error)

        }
        else{
            console.log("otp send:",info.response);
        }

    })
    
    res.redirect('/otp')

    }




    

}

const otpLoad=(req,res)=>{
    res.render("otp",{errorMessage:''})
}

const verifyOtp=async(req,res)=>{
    try{
        const enterOtp=req.body.otp;
        console.log(enterOtp)
        if(otp===enterOtp){
            // await collection.insertMany([data])
        
        res.redirect("/login")
        }
        else{
            res.render("otp",{ errorMessage: 'Invalid OTP. Please try again.' })
        }
    }
    catch(error){
        console.error(error);
        res.status(500).send("internal server error")
    }

}

const userLogout=async(req,res)=>{
    req.session.destroy(function (err) {
        if (err) {
          console.log(err);
          res.redirect("/")
        } else {
          console.log("logout successful");
          res.status(200)
          res.redirect('/')
        }
      });
}
const PAGESIZES = 4;
const categorywiseLoad=async(req,res)=>{
    try{
    const userId=req.session.user;
    const catId = req.params.id;
    const user=await collection.findOne({email:userId})
    const currentPage = parseInt(req.query.page) || 1;
    const skip = (currentPage - 1) * PAGESIZES;
    const products=await productcollection.find({category:catId}).skip(skip)
    .limit(PAGESIZE)
    .exec();
    
    

    res.render('category', { products, user, currentPage,category:catId});
                


}catch(error){
    console.log(error);
    res.status(500).send('Internal Server Error');

}
}


const productdetail=async (req,res)=>{
    const  id = req.params.id;
    console.log(id)
    const products = await productcollection.findById(id)
    res.render('productdetails',{products})
}

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

// const generateInvoicePDF = async (orderItems) => {
//     const PDFDocument = require('pdfkit');
// const fs = require('fs');
// const path = require('path');
//     const doc = new PDFDocument();
//     const fileName = 'invoice.pdf';
   
//     const filePath = `./public/pdf/${fileName}`; // Adjust the path as needed
   
//     doc.pipe(fs.createWriteStream(filePath));
  
//     // Add content to the PDF
//     doc.fontSize(16).text('Order Invoice', { align: 'center' });
//     doc.moveDown();
    
//     orderItems.forEach((item)=>{
//       doc.fontSize(12).text(`Product Name: ${item.product.name}`);
//       doc.fontSize(12).text(`Quantity: ${item.quantity}`);
//       doc.fontSize(12).text(`Price: ₹${item.product.price}`);
//       doc.moveDown();
//     });
  
//     // Add more information as needed
  
//     doc.end();
  
//     return filePath;
//   };
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
        const user = await collection.findOne({ email: userId }).populate('orders.product');
        // const pdfFilePath = await generateInvoicePDF(user.orders);
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
       
        if (order.paymentmethod === 'Online Payment' && (order.status === 'Pending' || order.status === 'Shipped' || order.status === 'Out for Delivery')) {
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
        const orderId = req.params.id;
        const userId = req.session.user;
        const user=await collection.findOne({email:userId}).populate('orders.product');
        const orderDetails=await collection.findOne({'orders._id':orderId}).populate('orders.product')
        const order = orderDetails.orders.find(order => order._id == orderId);

        if ((order.paymentmethod === 'Online Payment' || order.paymentmethod === 'Cash On Delivery') && order.status === 'Delivered') {
            const wallet = await walletcollection.findOneAndUpdate(
                { customerid: user._id },
                { $inc: {Amount: (order.totalPrice+50) } },
                { new: true }
            ) 
        }

        for (const order of user.orders) {
            const product = order.product;
            const orderedQuantity = order.quantity;
            product.stock += orderedQuantity;
            await product.save();
        }
           

        const updateorder = await collection.findOneAndUpdate(
            { 'orders._id': orderId }, 
            { $set: {'orders.$.status': 'Returned' } }, 
            { new: true } 
        );
        res.redirect('/user/orders')

    }catch(error){
        console.log("Error",error)
    }
}

const wishLoad=async(req,res)=>{
    try{
        const users=req.session.user
        console.log('us:',users);
        const product=await wishlistcollection.find({}).populate('Product')
        const user=await collection.findOne({email:users})
        console.log('ur:',user);
        if(user){
           res.render('wishlist',{product}) 
        }else{
            throw "User not found"
        }
        
    }
    catch(err){
        console.log("Error in Wishlist load",err)

    }
}

const addToWish=async(req,res)=>{
    const productId=req.params.id;
    try{
        const product=await productcollection.findOne({_id:productId})
        const user = await collection.findOne({ email:req.session.user});
        if(user&&product){
            const isExist=await wishlistcollection.findOne({UserId:user._id,Product:product._id})
            console.log('isExist',isExist);
            if(!isExist){
                const data={
                    UserId:user._id,
                    Product:productId,
                    
                    }
                    const result=await wishlistcollection.insertMany([data])
                    console.log("Add to wish list successfull")
            }else{
                console.log("Product already exist in your wishlist");
            }

        }else{
            throw "Product or User Not Found"
        }

        res.redirect('/')
        

    }catch(error){
        console.log("Error adding to wishlist",error)

    }
}

const removeFromWishlist = async (req, res) => {
    const userId = req.session.user;
    const productId = req.params.id;

    try {
        // Find the user based on the email
        const user = await collection.findOne({ email: userId });

        if (user) {
            // Find the wishlist item based on the product ID
            const wishlistItem = await wishlistcollection.findOneAndRemove({
                UserId: user._id,
                'Product': productId
            });
            res.redirect('/user/wishlist');

        } else {
            // User not found
            console.log('No such user found');
            res.redirect('user/wishlist'); // Redirect to the wishlist page or handle accordingly
        }
    } catch (error) {
        console.log('Error removing from wishlist', error);
        res.redirect('user/wishlist'); // Redirect to the wishlist page or handle accordingly
    }
};

const wishlistAddCart=async(req,res)=>{
    const userId = req.session.user;
    const productId = req.params.id;

    try{
        const product = await productcollection.findOne({ _id: productId });
        const user = await collection.findOne({ email: userId });
        const existingProductIndex = user.cart.findIndex(item => item.product.toString() === productId);
            if (existingProductIndex !== -1) {
            
            user.cart[existingProductIndex].quantity += 1;
                
            }else{

                productPrice=product.price
                offerPrices=product.OfferPrice
              
            const newCart = {
                product:productId,  
                quantity: 1,
                totalPrice:offerPrices > 0 ? offerPrices : productPrice,
            };
            user.cart.push(newCart)
            }
            await user.save();

            const wishlistItem = await wishlistcollection.findOneAndRemove({
                UserId: user._id,
                'Product': productId
            });
            res.redirect('/user/wishlist');

    }catch(error){
        console.log("Error Adding Product To Cart From Wishlist",error)

    }

}


const cartLoad=async(req,res)=>{
    try {
        const userId = req.session.user; 
        const product=await productcollection.find({}).limit(4)
        console.log("pr",product);
        const user = await collection.findOne({ email: userId }).populate('cart.product');
        if (user) {
            let totalprice=0;
            user.cart.forEach(element => {
                totalprice+=element.product.price*element.quantity
                
            });
           

            
          res.render('cart', { cartItems: user.cart,totalprice,product});
        } else {
          res.status(404).send('User not found');
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        res.status(500).send('Internal Server Error');
      }
}

const addToCart = async (req, res) => {
    const userId = req.session.user;
    const productId = req.params.id;
   
    try {
        const product = await productcollection.findOne({ _id: productId });
        const user = await collection.findOne({ email: userId });
       
   
        if (user && product) {
           
            const existingProductIndex = user.cart.findIndex(item => item.product.toString() === productId);
            
            if (existingProductIndex !== -1) {
            
            user.cart[existingProductIndex].quantity += 1;
                
            }else{
                productPrice=product.price
                offerPrices=product.OfferPrice
              
            const newCart = {
                product:productId,  
                quantity: 1,
                totalPrice:offerPrices > 0 ? offerPrices : productPrice,
            };
            user.cart.push(newCart)
            }
            await user.save();
            
            console.log('Successfully added to cart');
          res.redirect('/')
        } else {
            res.status(404).send('User and product not found');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).send('Internal Server Error');
    }
}

const removeFromCart = async (req, res) => {
    const userId = req.session.user;
    const productId = req.params.id; 

    try {
        const user = await collection.findOne({ email: userId });

        if (user) {
           
            const itemIndex = user.cart.findIndex(item => item.product.toString() === productId);

            if (itemIndex !== -1) {
               
                user.cart.splice(itemIndex, 1);
                await user.save(); 

                console.log('Successfully removed item from cart');
                res.redirect('/user/cart');
            } else {
                res.status(404).send('Item not found in the cart');
            }
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).send('Internal Server Error');
    }
}



const quantityUpdate=async (req, res) => {
    const productId = req.params.productId; 
    const newQuantity = req.body.quantity;
    const session=req.session.user
 
    try {
        let products=await productcollection.findById(productId)
        
      const User = await collection.findOne({email:session});

     
      if (!User) {
        return res.status(404).json({ message: 'User not found' });
      }
      
    //   const productItem=products.find()
      // Find the specific product in the user's cart and update its quantity
      const cartItem = User.cart.find(item => item.product.toString() === productId);

      if (cartItem) {
        const requestedQuantity = newQuantity;
        const availableStock = products.stock;

        if (requestedQuantity > availableStock) {
            return res.status(400).json({ message: 'Product Out of Stock' });
        }

        cartItem.quantity = requestedQuantity;
        
        await User.save(); 
        let totalPrices=0;
        let productPrice=products.price
        let offerPrices=products.OfferPrice
        User.cart.forEach(item=>{

            totalPrices+=(offerPrices > 0 ? offerPrices : productPrice)*item.quantity;
           
            
        })
        
        User.totalPrice=totalPrices;
        await User.save();


        return res.status(200).json({ message1: 'Quantity updated successfully' });
      } else {
        return res.status(404).json({ message1: 'Product not found in the cart' });
      }


    } catch (error) {
      return res.status(500).json({ message: 'Error updating quantity', error: error.message });
    }
  };


  const couponAdd=async(req,res)=>{
    const email=req.session.user
   
    try{
        const couponCode = req.query.code;
        const totalPrice=req.query.total
        const minimumAmount = 5000;
        const coupon = await couponCollection.findOne({ couponCode });

        if (!coupon || coupon.expirationDate < new Date()) {
          return res.json({ success: false, message: "Coupon Expired" });
        }
       
        const user = await collection.findOne({email:email});
        if (user.redeemedCoupons.some((redeemedCoupon) => redeemedCoupon.couponCode === couponCode)) {
            return res.json({ success: false, message: "You have already used this coupon" });
        }
    
        if (!user) {
          return res.json({ success: false, message: "User not found" });
        }
        if (totalPrice <= minimumAmount) {
            return res.json({ success: false, message: `Minimum amount of ${minimumAmount} is required to claim the coupon` });
        }
        const newTotal = totalPrice - coupon.discountAmount;
        console.log('nwt:',newTotal);
        user.totalPrice = newTotal;
        user.redeemedCoupons.push({
            couponCode: couponCode,
        });

       
        await user.save();
 
        res.json({success:true, newTotal });


    }catch(error){
        console.error("Error applying coupon:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
  
 const cartPost= async(req,res)=>{
    try {
        const userId = req.session.user; 
        const totalPrice = req.body.totalAmount;
        const totalAmount = parseInt(totalPrice);
        const user = await collection.findOne({ email: userId }).populate('cart.product').populate('orders.product')   
        const address=await addressCollection.find({userId:user._id })
        // user.totalPrice=totalAmount
        // await user.save();
        if (user) {
          res.render('checkout', { cartItems: user.cart,user,totalAmount,address});
        } else {
          res.status(404).send('User not found');
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        res.status(500).send('Internal Server Error');
      }

 }

const checkoutLoad=async(req,res)=>{
    try {
        const userId = req.session.user;
        const users=await collection.findOne({email:userId}) 
        const user = await collection.findOne({ email: userId }).populate('cart.product').populate('orders.product') 
        const wallet=await walletcollection.findOne({customerid:users._id})
        if (wallet && wallet.Amount !== undefined) {
            console.log("Amount:", wallet.Amount);
        } else {
            console.log("Wallet or Amount not found");
        }
        const totalAmount = Number(req.body.totalAmount);
        const address=await addressCollection.find({userId:user._id })
        if (isNaN(totalAmount)) {
            console.error('Invalid totalAmount value:', req.body.totalAmount);
            res.status(400).send('Bad Request');
            return;
        }
        user.totalPrice=totalAmount+50
        await user.save();
        
        if (user) {
          res.render('checkout', { cartItems: user.cart,user,totalAmount,address,wallet:wallet.Amount});
        } else {
          res.status(404).send('User not found');
        }
      } catch (error) {
        console.error('Error loading checkout:', error);
        res.status(500).send('Internal Server Error');
      }
}



const checkoutAddAddress=async(req,res)=>{
    const userId = req.session.user;
    const user = await collection.findOne({ email: userId });
   
    res.render('checkoutaddaddress',{user})
}

const updateCheckoutAddress=async(req,res)=>{
    
        const id=req.session.user;
        const user= await collection.findOne({email:id})
      const  newAddress={
            userId:user._id,  
            houseName: req.body.houseName,
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
            country: req.body.country,
            }
        
        
        try{
       const user= await collection.findOne({email:id})
       
       if(user){
        await addressCollection.insertMany([newAddress])
        res.redirect('/user/cart')
       
    }else{
        res.status(404).send('User not found');
    }
}catch(error){
        console.log("address data error")
      } 
}

const editCheckoutLoad=async(req,res)=>{
    const id=req.params.id;
    const user=await addressCollection.findById(id)
    res.render('checkouteditaddress',{user})
}

const updateeditCheckoutAddress=async(req,res)=>{
    try{
        let id=req.params.id;
        const  newAddress={
            houseName: req.body.houseName,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        country: req.body.country,
        } 
        const result = await addressCollection.findByIdAndUpdate(id, {$set:{address:newAddress}})
        if(!result){
            console.log('not found')
        }else{
            res.redirect("/user/cart") 
        }

    }catch(err){
        console.log('Error updating the product:',err);
        
    }
}



const conformLoad=async(req,res)=>{
    try{
        const userId = req.session.user; 
        const users=await collection.findOne({email:userId})
        const user = await collection.findOne({ email: userId }).populate('cart.product').populate('orders.product');
        
        if(user){
           
            const method=req.body.method;
            if (req.body.razorpay_payment_id) {
               
                const payorderid = req.body.razorpay_payment_id
                const customerId=user._id
                const CustomerName = user.name;
                
                
                var instance = new Razorpay({ key_id: 'rzp_test_dnwNaYmhWn2A9y', key_secret: 'I2lfM5HtAYtRkJ0xwFpRbLCw' })
                instance.payments.fetch(payorderid).then(async (data) => {
                   
                    const paymentmethod = data.notes.paymentmethod;
                    const addressmethod=data.notes.address;
                    try {
                        const selectedAddressIndex = req.body.selectedAddress;
                        for (const item of user.cart) {
                            
                            const orderItem = {
                                product: item.product,
                                productName: item.productName,
                                quantity: item.quantity,
                                paymentmethod:paymentmethod,
                                totalPrice:(item.totalPrice*item.quantity),
                                addressId:addressmethod,
                            };
        
                            user.orders.push(orderItem);
                        }
                            
                        for (const order of user.orders) {
                            const product = order.product;
                            const orderedQuantity = order.quantity;
                            product.stock -= orderedQuantity;
                            await product.save();
                        }
                       
                        
                            user.cart = [];
                            await user.save();
                            res.render('conform')
                    
                    } catch (error) {
                        console.log("Error due to successful page rendering error:", error);
                        res.status(500).send("Error due to successful page rendering error");
                    }
                })
            
        
            
        }else if(method=='Cash On Delivery'){
            // const total=req.body.totalAmount
            const selectedAddressIndex = req.body.selectedAddress;
            console.log('sel',selectedAddressIndex);
                for (const item of user.cart) {
                    const orderItem = {
                        product: item.product,
                        productName: item.productName,
                        quantity: item.quantity,
                        paymentmethod: method,
                        totalPrice:(item.totalPrice*item.quantity),
                        addressId:selectedAddressIndex,
                    };
                    user.orders.push(orderItem);
                }    
                for (const order of user.orders) {
                    const product = order.product;
                    const orderedQuantity = order.quantity;
                    product.stock -= orderedQuantity;
                    await product.save();
                }
                    user.cart = [];
                    await user.save();
                    res.render('conform')
            
            }else if(method=='Wallet'){
                // const total=req.body.totalAmount
                const wallet=await walletcollection.findOne({customerid:users._id}) 
                const selectedAddressIndex = req.body.selectedAddress;
                    for (const item of user.cart) {
                        const orderItem = {
                            product: item.product,
                            productName: item.productName,
                            quantity: item.quantity,
                            paymentmethod: method,
                            totalPrice:(item.totalPrice*item.quantity),
                            addressId:selectedAddressIndex,
                            
                        };
                        const conf= await walletcollection.findOneAndUpdate(
                            { customerid: users._id },
                            { $inc: {Amount:(-(item.totalPrice*item.quantity)-50)},
                            $push:{
                                transactions:{
                                    type:'debit',
                                    amount:((item.totalPrice*item.quantity)+50),
                                },
                            },
                        },
                            { new: true });

                        user.orders.push(orderItem);
                    }
                   
                   
                      
                    for (const order of user.orders) {
                        const product = order.product;
                        const orderedQuantity = order.quantity;
                        product.stock -= orderedQuantity;
                        await product.save();
                    }
                    // user.totalPrice=total
                        user.cart = [];
                        await user.save();
                    
                       

                        res.render('conform')
                    
                }

   
        }else{
            throw 'User not logged in'
        }

    } catch (error) {
        console.error('Error loading cart:', error);
        res.status(500).send('Internal Server Error');
      }  
}
var instance = new Razorpay({
    key_id: 'rzp_test_dnwNaYmhWn2A9y',
    key_secret: 'I2lfM5HtAYtRkJ0xwFpRbLCw',
  });

const paypost = async(req, res) => {
    const userId = req.session.user; 
    const user = await collection.findOne({ email: userId })
    const total=user.totalPrice
   
    instance.orders.create({
        amount: (total)*100,
        currency: "INR",
        receipt: "receipt#1",
        notes: {
            key1: "value3",
            key2: "value2"
        }
    }).then((data) => {

        return res.json(data)
    })
}



  


module.exports={
    loginLoad,signupLoad,forgotLoad,verifyEmail,forgototpverify,setnewpassword,
    homeLoad,productsLoad,verifyLogin,
    insertUser,otpLoad,categorywiseLoad,
    verifyOtp,userLogout,
    productdetail,cancelOrder,returnOrder,viewMore,
    profileLoad,resetLoad,walletLoad,invoice,
    addaddressLoad,updateAddress,editAddress
    ,addressUpdate,editProfile,updateProfile,resetCheck,wishLoad,addToWish,removeFromWishlist,wishlistAddCart,
    cartLoad,addToCart,removeFromCart,quantityUpdate,couponAdd,
    checkoutLoad,checkoutAddAddress,updateCheckoutAddress,
    conformLoad,editCheckoutLoad,updateeditCheckoutAddress,
    ordersLoad,paypost,cartPost,
    
}