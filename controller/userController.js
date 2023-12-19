const userCollection=require('../model/userdb')
const nodemailer=require("nodemailer");
const generateOtp=require("generate-otp");
const productcollection = require('../model/productdb');
const walletcollection=require("../model/walletdb")
const referralcollection=require("../model/referraldb")
const Razorpay = require('razorpay');
const dotenv=require('dotenv').config();
const { clear } = require('console');

const loginLoad=async(req,res)=>{
    try{
    const error=''
    if(req.session.user){
      res.redirect('/')  
    }
    else{
        res.render('login',{error})
    }
}catch(error){
    console.log(error)
    res.status(500).send('Internal Server Error');
}
}

const signupLoad=async(req,res)=>{
    try{

   
    const message='';
    const message1=''
    if(req.session.user){
        res.redirect('/')
    }
    else{
        res.render('signup',{message,message1})
    }
    }catch(error){
        console.log(error);
        res.status(500).send('Internal Server Error');
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
                .exec(); 

                    
            const users = await userCollection.findOne({ email: req.session.user });
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
                .exec(); 

            const users = await userCollection.findOne({ email: req.session.user });

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
        const userremail=await userCollection.findOne({email:req.body.email})

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
        from:`${req.body.email}`,
        to:`${req.body.email}`,
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
        const user=await userCollection.findById(id)
        
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
        const user=await userCollection.findById(id)
      
        console.log('uu',user)


        await userCollection.findByIdAndUpdate(id, { password:newPassword });

        res.redirect('/login')

    }catch(error){
        console.error(error);
        res.status(500).send("internal server error")
    }
}


const verifyLogin=async(req,res)=>{
    try{
    const error='';
    const check=await userCollection.findOne({email:req.body.email})
    if(check){
if(check.password===req.body.password&&check.blocked===false){
req.session.user=req.body.email

res.redirect("/")
}
else{
    res.render("login",{ error: "Invalid password" })

} 
} else {
    
    res.render("login", { error: "Email not found" });
}
}
    catch(error){
        console.error(error);
        res.status(500).send("internal server error")
    }

}


const insertUser=async(req,res)=>{
    try{

   
    function generateReferralCode(name) {
        return Math.random().toString(36).substr(2, 8).toUpperCase();
      }
      const referralCode = generateReferralCode(req.body.name);
    
    data={
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        password:req.body.password,
        referral:referralCode,
    }

    

    const refcheck=await userCollection.findOne({referral:req.body.referralCode})
    const check=await userCollection.findOne({email:req.body.email})
    const message='Email Already Exist'

    if(check){
        res.render('signup',{message})
    }else if(!refcheck){
        const message1='referral Code Not Found'
        res.render('signup',{message1})
    }else{
        
    

    const id=await userCollection.findOne({referral:referralCode})
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

      let refferaluser=await userCollection.findOne({referral:req.body.referralCode})
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
    console.log('otp',otp)
    const mailOptions={
        from:`${req.body.email}`,
        to:`${req.body.email}`,
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
}catch(error){
    console.log('Error in creating a Referral Code', error);
    res.status(500).send("internal server error")
}
}

const otpLoad=(req,res)=>{
    try{

    
    res.render("otp",{errorMessage:''})
}catch(error){
    console.log('Error in loading the page for OTP', error);
    res.status(500).send("internal server error")
}
}

const verifyOtp=async(req,res)=>{
    try{
        const enterOtp=req.body.otp;
        console.log(enterOtp)
        if(otp===enterOtp){
            
            await userCollection.insertMany([data])
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
    const user=await userCollection.findOne({email:userId})
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
    try{

    const  id = req.params.id;
    console.log(id)
    const products = await productcollection.findById(id)
    res.render('productdetails',{products})
}catch(error){
    console.log(error);
    res.status(500).send('Internal Server Error');
}
}
let instance = new Razorpay({
    key_id:process.env.KEYID ,
    key_secret:process.env.KEYSECRET,
  });

const paypost = async(req, res) => {
    const userId = req.session.user; 
    const user = await userCollection.findOne({ email: userId })
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
    productdetail,
    paypost,
    
}