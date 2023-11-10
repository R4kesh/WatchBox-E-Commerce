const mongoose = require('mongoose')

// connecting the mongodb server
mongoose.connect("mongodb://127.0.0.1:27017/User_watchbox")
.then(()=>{
    console.log("Mongodb is connected properly");
}).catch(()=>{
    console.log("Mongodb is not connected properly");
})

// declaring the schema for the database
const watchUsers= new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        require:true,
        
    },
    phone:{
        type:Number,
        require:true,
    },
    password :{
        type : String,
        required : true,
    },
    blocked:{
        type:Boolean,
        required:true,
        default:false
        
    },
    created : {
        type : Date,
        required : true,
        default : Date.now,
    },
    address: [{
        houseName: {
            type: String,
            required: true,
        },
        street: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        pincode: {
            type: Number,
            required: true,
        },
        country: {
            type: String,
            required: true,
        }
    }],
    cart: [{
            product: {
            type:mongoose.Schema.Types.ObjectId,
            ref: 'products' ,
            required: true,
        },
        productName:String,
        quantity: {
            type: Number,
            required:true,
            default: 1 
        },
         totalPrice: {
        type: Number,
        default: 0  
    },

       
    }],
    totalPrice: {
        type: Number,
        default: 0  
    },
   orders:[{
        product: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'products' ,
        required: true,
    },
    productName: String,
    quantity: {
    type: Number,
     required: true,
    default: 1
    },
    status:{
        type:String,
        default:'Pending',
    },
    orderDate: {
        type: Date,
        required: true,
        default: Date.now
    },
   }],
  
  

})

// declaring the collection name
const collection = new mongoose.model("usercollection",watchUsers)

module.exports = collection