const collection=require('../model/userdb')
// const user_Routes=require('../routes/userroutes')
const nodemailer=require("nodemailer");
const generateOtp=require("generate-otp");
const productcollection = require('../model/productdb');
const mongoose = require('mongoose');

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
        if (req.session.user) {
            const currentPage = parseInt(req.query.page) || 1;
            const skip = (currentPage - 1) * PAGE_SIZE;

            const products = await productcollection
                .find()
                .skip(skip)
                .limit(PAGE_SIZE)
                .exec(); // Use .exec() to execute the query

            const users = await collection.findOne({ email: req.session.user });

            res.render('home', { products, users, currentPage });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
const PAGESIZE = 8;
const productsLoad= async (req, res) => {
    try {
        if (req.session.user) {
            const currentPage = parseInt(req.query.page) || 1;
            const skip = (currentPage - 1) * PAGESIZE;

            const products = await productcollection
                .find()
                .skip(skip)
                .limit(PAGESIZE)
                .exec(); // Use .exec() to execute the query

            const users = await collection.findOne({ email: req.session.user });

            res.render('products', { products, users, currentPage });
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

};





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
    console.log("idis:",id)
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
 
  
//     const result=await collection.findByIdAndUpdate(id,{
//         houseName: req.body.houseName,
//         street: req.body.street,
//         city: req.body.city,
//         state: req.body.state,
//         pincode: req.body.pincode,
//         country: req.body.country,
//     })
//     if(!result){
//         console.log('not found')
//     }else{
//       res.redirect('/user/profile')  
//     }
// }catch(err){
//     console.log('Error updating the address : ',err);  
// }
// }

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
        //fghjkl

    }catch(err){
        console.log('Error updating the product : ',err);
        
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
            { 'orders._id': orderId }, // Search condition
            { $set: { 'orders.$.status': 'Cancelled' } }, // Update status to 'Cancelled'
            { new: true } // To get the updated order
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
        console.log(product);
        
        
        console.log('2');
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
            console.log('4');
        
            
            user.cart.push(newCart)


            }
            await user.save();


            console.log('5');
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
      console.log('it',cartItem);
      if (cartItem) {
        console.log('ne',newQuantity);
        cartItem.quantity = newQuantity;
        console.log('a:',cartItem.quantity)
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
            // user.orders = user.orders.concat(user.cart);
            for (const item of user.cart) {
                user.orders.push(item);
            }
                
            for (const order of user.orders) {
                const product = order.product;
                const orderedQuantity = order.quantity;
                console.log('qu',orderedQuantity)
                product.stock -= orderedQuantity;
                await product.save();
            }
           
                user.cart = [];
                
                await user.save();

        }else{
            throw 'User not logged in'
        }


    } catch (error) {
        console.error('Error loading cart:', error);
        res.status(500).send('Internal Server Error');
      }


    res.render('conform')
}



module.exports={
    loginLoad,signupLoad,
    homeLoad,productsLoad,verifyLogin,
    insertUser,otpLoad,
    verifyOtp,userLogout,
    productdetail,cancelOrder,profileLoad,
    addaddressLoad,updateAddress,editAddress
    ,addressUpdate,editProfile,updateProfile,
    cartLoad,addToCart,removeFromCart,quantityUpdate,
    checkoutLoad,checkoutAddAddress,updateCheckoutAddress,
    conformLoad,editCheckoutLoad,updateeditCheckoutAddress,
    ordersLoad,
}