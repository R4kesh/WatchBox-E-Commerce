const mongoose = require('mongoose')

const productSchema=new mongoose.Schema({
    name:{
        type:String,
        require:true,
    },
    description:{
        type:String,
        require:true,
    },
    price:{
        type:Number,
        require:true,
    },
    category:{
        type:String,
        require:true,
    },
    image:[{
        type:String,
        // require:true,
    }],
    stock:{
        type:Number,
        require:true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
})

const productcollection=new mongoose.model('products',productSchema)

module.exports=productcollection;