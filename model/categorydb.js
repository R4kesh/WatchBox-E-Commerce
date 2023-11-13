const mongoose=require('mongoose')

const categorySchema=new mongoose.Schema({
    category:{
        type:String,
        require:true,
    },
    description:{
        type:String,
        require:true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
})

const categorycollection=new mongoose.model('category',categorySchema)
module.exports=categorycollection;