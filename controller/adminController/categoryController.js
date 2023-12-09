const collection = require("../../model/userdb");
const productcollection=require('../../model/productdb');
const categorycollection = require("../../model/categorydb");
const couponCollection=require("../../model/coupondb")
const sharp=require('sharp')
const dotenv=require('dotenv').config();

const categoryLoad=async(req,res)=>{
    try {
    const category=await categorycollection.find()
    res.render('category',{category})
} catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
}
}


const addcategory=async(req,res)=>{
    const error='';
    res.render('addcategory',{error})
}

const insertCategory=async(req,res)=>{
    try{
        const enteredCategory = req.body.category.toLowerCase();
        
        const existingCategory = await categorycollection.findOne({
            category: { $regex: new RegExp('^' + enteredCategory + '$', 'i') }
        });
        console.log('ex',existingCategory);
        if (existingCategory) {
            
            res.render('addcategory', { error: 'Category already exists' });
        } else {
            const categorydata={
                category:req.body.category,
                description:req.body.description,
            }
            
            await categorycollection.insertMany([categorydata]);
            res.redirect('/admin/category');
        }
    }catch(error){
        console.log(error)
    }
    
}


const editCategory = async (req, res) => {
    let id = req.params.id;
    try {
        const category = await categorycollection.findById(id);
        if (!category) {
            return res.redirect('/admin/category');
        }

        // Render the editcategory form
        res.render('editcategory', { category: category, message: '',errors: {} });
    } catch (error) {
        console.log("Error in finding the Category : ", error);
        res.redirect('/admin/category');
    }
}
const updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const enteredCategory = req.body.category.trim(); // Trim to handle whitespace-only input
        const enteredDescription = req.body.description.trim(); // Trim to handle whitespace-only input

        // Simple validation
        const errors = {};

        // Check if category is empty
        if (!enteredCategory) {
            errors.category = { msg: 'Category is required.' };
        }

        // Check if description is empty (optional, adjust as needed)
        if (!enteredDescription) {
            errors.description = { msg: 'Description is required.' };
        }

        // Check if the category already exists
        const existingCategory = await categorycollection.findOne({
            $and: [
                { category: { $regex: new RegExp('^' + enteredCategory + '$', 'i') } },
                { _id: { $ne: categoryId } }
            ],
            isDeleted: false
        });

        if (existingCategory) {
            errors.category = { msg: 'Category already exists.' };
        }

        // Check if there are any validation errors
        if (Object.keys(errors).length > 0) {
            // Pass the errors to the rendering context
            return res.render('editcategory', { category: req.body, errors,message: '' });
        }

        // If no validation errors, proceed with updating category
        const result = await categorycollection.findByIdAndUpdate(categoryId, {
            category: enteredCategory,
            description: enteredDescription,
        });

        if (!result) {
            console.log('Category not found');
        } else {
            res.redirect('/admin/category');
        }
    } catch (error) {
        console.log("Error updating the Category: ", error);
        res.redirect('/admin/category');
    }
};








const deletecategory=async(req,res)=>{
    try{
        const id=req.params.id;
        const result= await categorycollection.findByIdAndUpdate(id,{ isDeleted: false });
        if(result){
            res.redirect('/admin/category')
        }else{
            console.log('product not found')
        }
    }catch(error){
        console.error('Error deleting category:',error)
    }
}

const undeletecategory=async(req,res)=>{
    try{
        const id=req.params.id;
        const result= await categorycollection.findByIdAndUpdate(id,{ isDeleted: true });
        if(result){
            res.redirect('/admin/category')
        }else{
            console.log('product not found')
        }
    }catch(error){
        console.error('Error deleting category:',error)
    }
}

module.exports={
    categoryLoad,
    insertCategory,
    addcategory,
    editCategory,
    updateCategory,
    deletecategory,undeletecategory,
}