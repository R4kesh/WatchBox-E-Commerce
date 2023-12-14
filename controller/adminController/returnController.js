const userCollection = require("../../model/userdb");
const returnCollection = require("../../model/returndb");

const returnLoad=async (req,res)=>{
    try{
        const orderreturn = await returnCollection.find({}).populate('product');

        orderreturn.forEach(retur => {
            retur.productName = retur.product ? retur.product.name : 'N/A';
        });
        
     res.render("return",{orderreturn})
        
    }catch(error){
        console.error("Error due to render coupon:", error);
    res.status(500).send("Error due to coupon");
    }
} 

module.exports={
    returnLoad,
}

// const returnapproval=async