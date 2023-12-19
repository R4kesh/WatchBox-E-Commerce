const userCollection=require('../../model/userdb')
const productcollection = require('../../model/productdb');
const wishlistcollection=require("../../model/wishlistdb")


const wishLoad=async(req,res)=>{
    try{
        const users=req.session.user
      
        const product=await wishlistcollection.find({}).populate('Product')
        const user=await userCollection.findOne({email:users})
        
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
        const user = await userCollection.findOne({ email:req.session.user});
        if(user&&product){
            const isExist=await wishlistcollection.findOne({UserId:user._id,Product:product._id})
           
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
    
        const user = await userCollection.findOne({ email: userId });

        if (user) {
            
            const wishlistItem = await wishlistcollection.findOneAndRemove({
                UserId: user._id,
                'Product': productId
            });
            res.redirect('/user/wishlist');

        } else {
           
            console.log('No such user found');
            res.redirect('user/wishlist'); 
        }
    } catch (error) {
        console.log('Error removing from wishlist', error);
        res.redirect('user/wishlist');
    }
};

const wishlistAddCart=async(req,res)=>{
    const userId = req.session.user;
    const productId = req.params.id;

    try{
        const product = await productcollection.findOne({ _id: productId });
        const user = await userCollection.findOne({ email: userId });
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

module.exports={
    wishLoad,addToWish,removeFromWishlist,wishlistAddCart,
}