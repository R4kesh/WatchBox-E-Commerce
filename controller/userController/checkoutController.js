const collection=require('../../model/userdb')
const addressCollection=require('../../model/addressdb')
const walletcollection=require("../../model/walletdb")
const Razorpay = require('razorpay');


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
        const wallet=await walletcollection.findOne({customerid:users._id})
        if(user){
           
            const method=req.body.method;
            if (req.body.razorpay_payment_id){
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
                       
                        if(wallet.redeemedCoupons.length>0){

                            const couponCodeToMove = wallet.redeemedCoupons[0].couponCode;
                            const redeemedCoupon = {
                                couponCode: couponCodeToMove,
                                redeemedAt: Date.now(),
                            };
                            user.redeemedCoupons.push(redeemedCoupon)
                            await user.save();
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

                if(wallet.redeemedCoupons.length>0){

                    const couponCodeToMove = wallet.redeemedCoupons[0].couponCode;
                    const redeemedCoupon = {
                        couponCode: couponCodeToMove,
                        redeemedAt: Date.now(),
                    };
                    user.redeemedCoupons.push(redeemedCoupon)
                    await user.save();
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

                    if(wallet.redeemedCoupons.length>0){

                        const couponCodeToMove = wallet.redeemedCoupons[0].couponCode;
                        const redeemedCoupon = {
                            couponCode: couponCodeToMove,
                            redeemedAt: Date.now(),
                        };
                        user.redeemedCoupons.push(redeemedCoupon)
                        await user.save();
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

module.exports={
    checkoutLoad,checkoutAddAddress,updateCheckoutAddress,
    conformLoad,editCheckoutLoad,updateeditCheckoutAddress,
}