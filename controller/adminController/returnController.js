const userCollection = require("../../model/userdb");
const returnCollection = require("../../model/returndb");
const returnLoad=async (req,res)=>{
    try{
        const orderreturn = await returnCollection.find({})
        
     res.render("return",{orderreturn})
        
    }catch(error){
        console.error("Error due to render coupon:", error);
    res.status(500).send("Error due to coupon");
    }
} 

module.exports={
    returnLoad,
}