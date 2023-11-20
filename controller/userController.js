const collection=require('../model/userdb')
// const user_Routes=require('../routes/userroutes')
const nodemailer=require("nodemailer");
const generateOtp=require("generate-otp");
const productcollection = require('../model/productdb');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const bodyParser=require('body-parser');
const nodemon = require('nodemon');

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
    if(req.session.user){
        res.redirect('/')
    }
    else{
        res.render('signup',{message})
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
    
    const data={
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        password:req.body.password,
    }
    const check=await collection.findOne({email:req.body.email})
    const message='Email Already Exist'

    if(check){
        res.render('signup',{message})
    }else{
        
    await collection.insertMany([data])

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
const productdetail=async (req,res)=>{
    const  id = req.params.id;
    console.log(id)
    const products = await productcollection.findById(id)
    res.render('productdetails',{products})
}

const profileLoad=async(req,res)=>{
    const session=req.session.user
    console.log('session:',session)
    const user = await collection.findOne({email:session})
    console.log("user:",user)
    res.render('profile',{user})
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

const ordersLoad=async(req,res)=>{
    try{
        const userId = req.session.user; 
        const user = await collection.findOne({ email: userId }).populate('orders.product');
        console.log('uuu',user)
        res.render('orderdetails',{orderItems:user.orders,user})

    }catch (error) {
        console.error('Error loading cart:', error);
        res.status(500).send('Internal Server Error');
      }

    
}

const cancelOrder=async(req,res)=>{
    try{
        const orderId = req.params.id;
        console.log('ii:',orderId);
        const order = await collection.findOneAndUpdate(
            { 'orders._id': orderId }, 
            { $set: { 'orders.$.status': 'Cancelled' } }, 
            { new: true } 
        );
       
        res.redirect('/user/orders')
   

    }catch (error) {
        console.error('Error loading :', error);
        res.status(500).send('Internal Server Error');
      }
}





const cartLoad=async(req,res)=>{
    try {
        const userId = req.session.user; 
        
        const user = await collection.findOne({ email: userId }).populate('cart.product');
        if (user) {
            
          res.render('cart', { cartItems: user.cart});
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
            //
            const existingProductIndex = user.cart.findIndex(item => item.product.toString() === productId);
            //
            if (existingProductIndex !== -1) {
            ///////
            user.cart[existingProductIndex].quantity += 1;
                
            }else{
            const newCart = {
                product:productId,  
                quantity: 1,
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

// const quantityUpdate=async (req, res) => {
//     const { cartItemId, newQuantity } = req.body;


//     try {
//         const updatedCartItem = await collection.findByIdAndUpdate(
//             cartItemId,
//             { quantity: newQuantity },
//             { new: true }
//         );

//         if (updatedCartItem) {
//             res.status(200).json(updatedCartItem);
//         } else {
//             res.status(404).send('Cart item not found');
//         }
//     } catch (error) {
//         res.status(500).send('Error updating quantity in the database');
//     }

// }


const quantityUpdate=async (req, res) => {
    const productId = req.params.productId; 
    const newQuantity = req.body.quantity;
    const session=req.session.user
  console.log('userss:',session);
 
   
    try {
        var products=await productcollection.findById(productId)
        
      const User = await collection.findOne({email:session});


      console.log(User)
      if (!User) {
        return res.status(404).json({ message: 'User not found' });
      }
      
    //   const productItem=products.find()
      // Find the specific product in the user's cart and update its quantity
      const cartItem = User.cart.find(item => item.product.toString() === productId);

      if (cartItem) {
        cartItem.quantity = newQuantity;
        
        await User.save(); 
        let totalPrices=0;
        
        User.cart.forEach(item=>{

            totalPrices+=products.price*item.quantity;
            
        })
        User.totalPrice=totalPrices;
        await User.save();


        return res.status(200).json({ message: 'Quantity updated successfully' });
      } else {
        return res.status(404).json({ message: 'Product not found in the cart' });
      }


    } catch (error) {
      return res.status(500).json({ message: 'Error updating quantity', error: error.message });
    }
  };
  











const checkoutLoad=async(req,res)=>{
    try {
        const userId = req.session.user; 
        
        const user = await collection.findOne({ email: userId }).populate('cart.product').populate('orders.product');
        if (user) {
          res.render('checkout', { cartItems: user.cart,user});
        } else {
          res.status(404).send('User not found');
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        res.status(500).send('Internal Server Error');
      }
}

const checkoutAddAddress=async(req,res)=>{
    const userId = req.session.user;
    const user = await collection.findOne({ email: userId });
    console.log('uz',user)
    res.render('checkoutaddaddress',{user})
}

const updateCheckoutAddress=async(req,res)=>{
    
        const id=req.session.user;
       
      const  newAddress={
                houseName: req.body.houseName,
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
            country: req.body.country,
            }
        
        
        try{
       const user= await collection.findOne({email:id})
       console.log('uy',user);
       if(user){
        await collection.updateOne(
            { email: id },
            { $push: { address: newAddress } }
        )
        res.redirect("/user/checkout")
       
    }else{
        res.status(404).send('User not found');
    }
}catch(error){
        console.log("address data error")
      } 
}

const editCheckoutLoad=async(req,res)=>{
    const id=req.params.id;
    const user=await collection.findById(id)
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
        const result = await collection.findByIdAndUpdate(id, {$set:{address:newAddress}})
        if(!result){
            console.log('not found')
        }else{
            res.redirect("/user/checkout") 
        }

    }catch(err){
        console.log('Error updating the product : ',err);
        
    }
}



const conformLoad=async(req,res)=>{
    try{
        
        
        const userId = req.session.user; 
        const user = await collection.findOne({ email: userId }).populate('cart.product').populate('orders.product');
        if(user){
            console.log('uus:',user);
            const method=req.body.method;
            console.log('met:',method);
           

            if (req.body.razorpay_payment_id) {
                const payorderid = req.body.razorpay_payment_id
                var instance = new Razorpay({ key_id: 'rzp_test_dnwNaYmhWn2A9y', key_secret: 'I2lfM5HtAYtRkJ0xwFpRbLCw' })
        
                instance.payments.fetch(payorderid).then(async (data) => {
                    const customerId=user._id
                    const CustomerName = user.name;
                    const totalAmount = user.totalPrice
                    const paymentmethod = data.notes.paymentmethod;
                    try {

                        for (const item of user.cart) {
                            const orderItem = {
                                product: item.product,
                                productName: item.productName,
                                quantity: item.quantity,
                                paymentmethod:paymentmethod,
                                totalPrice: item.totalPrice,
                                // Add other fields as needed
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

                for (const item of user.cart) {
                    const orderItem = {
                        product: item.product,
                        productName: item.productName,
                        quantity: item.quantity,
                        paymentmethod: method,
                        totalPrice: item.totalPrice,
                        // Add other fields as needed
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
        amount: (total+50)*100,
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
    insertUser,otpLoad,
    verifyOtp,userLogout,
    productdetail,cancelOrder,profileLoad,resetLoad,
    addaddressLoad,updateAddress,editAddress
    ,addressUpdate,editProfile,updateProfile,resetCheck,
    cartLoad,addToCart,removeFromCart,quantityUpdate,
    checkoutLoad,checkoutAddAddress,updateCheckoutAddress,
    conformLoad,editCheckoutLoad,updateeditCheckoutAddress,
    ordersLoad,paypost,
}