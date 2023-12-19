
const couponCollection=require("../../model/coupondb")
const dotenv=require('dotenv').config();

const couponLoad=async (req,res)=>{
    try{
        const coupons = await couponCollection.find({})
    return res.render("coupon", { coupons })
        
    }catch(error){
        console.error("Error due to render coupon:", error);
    res.status(500).send("Error due to coupon");
    }
} 

const addCoupon=async(req,res)=>{
    try{

        res.render('addcoupon')

    }catch(error){
        console.log("Error due to add Coupon: ",error);
        res.status(500).send("Error due to add Coupon");
    }
}


const insertCoupon=async(req,res)=>{
    let data={
        couponName:req.body.couponName,
        couponCode:req.body.couponCode,
        discountAmount:req.body.discountAmount,
        expirationDate: req.body.expirationDate,
        description:req.body.description,
    }
    try{
        const result=await couponCollection.insertMany([data]);
        if(!result){
            res.status(400).send("Coupon not added");
            }
            res.redirect('/admin/coupon')
    }catch(error){
        console.log("Error due to Insert Coupon: ",error);
        res.status(500).send("Error due to Add Coupon");
    }
}

const couponEditLoad=async(req,res)=>{
    try{
        const result=await couponCollection.findOne({_id:req.params.id})
        if(!result){
            res.status(400).send("Coupon not found");
            }
            
            res.render('editcoupon',{result})
    }catch(error){
        console.log("Error due to Edit Coupon: ",error);
        res.status(500).send("Error due to Edit Coupon");
    }
}

const couponUpdate=async(req,res)=>{
    try{
        let id=req.params.id;
        const result=await couponCollection.findByIdAndUpdate(id,{
            couponName:req.body.couponName,
        couponCode:req.body.couponCode,
        discountAmount:req.body.discountAmount,
        expirationDate: req.body.expirationDate,
        description:req.body.description,
        })
        if(!result){
            console.log('not found')
        }else{
            res.redirect('/admin/coupon')
        }

    }catch(error){
        console.log("Error due to Update Coupon: ",error);
        res.status(500).send("Error due to Update Coupon");
    }
}

const couponDelete=async(req,res)=>{
    try{
        const id=req.params.id;
        const result= await couponCollection.findByIdAndUpdate(id,{ isDeleted: false });
        if(!result){
            console.log('not found')
        }else{
            res.redirect('/admin/coupon');
        }

    }catch(error){
        console.log("Error due to Delete Coupon: ",error);
        res.status(500).send("Error due to Delete Coupon");
    }
}


const couponUndelete=async(req,res)=>{
    try{
        const id=req.params.id;
        const result= await couponCollection.findByIdAndUpdate(id,{ isDeleted: true });
        if(!result){
            console.log('not found')
            }else{
                res.redirect('/admin/coupon');
                }
    }catch(error){
        console.log("Error due to unDelete Coupon: ",error);
        res.status(500).send("Error due to unDelete Coupon");
    }
}

module.exports={
    couponLoad,addCoupon,insertCoupon
    ,couponEditLoad,couponUpdate,
    couponDelete,couponUndelete
}