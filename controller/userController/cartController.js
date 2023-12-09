const collection=require('../../model/userdb')
const productcollection = require('../../model/productdb');
const addressCollection=require('../../model/addressdb')
const couponCollection=require('../../model/coupondb');
const walletcollection = require('../../model/walletdb');




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
           

            
          res.render('cart', { cartItems: user.cart,totalprice,product,productdis:user.cart.product});
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
    
    try{
      const email=req.session.user
   const userz=await collection.findOne({email:email})
        const couponCode = req.query.code;
        const totalPrice=req.query.total
        const minimumAmount = 5000;
        const coupon = await couponCollection.findOne({ couponCode });
        const wallet = await walletcollection.findOne({customerid:userz._id})

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
        const calculatedDiscount=coupon.discountAmount;
        const newTotal = totalPrice - coupon.discountAmount;
        user.totalPrice = newTotal;
       
        if (wallet) {
          // Remove any existing redeemedCoupons array
          wallet.redeemedCoupons = [];
      
          // Insert the new array with the couponCode
          wallet.redeemedCoupons.push({
              couponCode: couponCode,
          });
      
          // Save the updated wallet
          await wallet.save();
      } else {
          console.error('Wallet not found for the given customer ID');
          // Handle the case where the wallet is not found
      }


        
        

       
        await user.save();
 
        res.json({success:true, newTotal,discountAmount: calculatedDiscount });
        


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
 module.exports={
    cartLoad,addToCart,removeFromCart,quantityUpdate,couponAdd,cartPost,
 }