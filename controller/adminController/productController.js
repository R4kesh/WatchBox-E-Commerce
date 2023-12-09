const productcollection=require("../../model/productdb")
const collection = require("../../model/userdb");
const categorycollection=require("../../model/categorydb")
const mongoose = require('mongoose');

const productsLoad = async (req, res) => {
    const page = parseInt(req.query.page) || 1; 
    const perPage = 4; 

    try {
        const totalProducts = await productcollection.countDocuments(); 

        const products = await productcollection.find()
            .find()
            .skip((page - 1) * perPage) 
            .limit(perPage); 

        res.render('products', {
            products,
            currentPage: page,
            pages: Math.ceil(totalProducts / perPage) 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const addProduct=async(req,res)=>{
    try {
        const categories = await categorycollection.find({ isDeleted: false }); 
        
        let error = '';
        res.render('addproducts', { error, categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}


const insertProduct = async (req, res) => {
    try {
        const enteredProductName = req.body.name.toLowerCase();
        const categories = await categorycollection.find({ isDeleted: false }); 
       
        const existingProduct = await productcollection.findOne({
            name: { $regex: new RegExp('^' + enteredProductName + '$', 'i') }
        });

        if (existingProduct) {
            res.render('addproducts', { error: 'Product already exists',categories });
        } else {
            const price = Number(req.body.price);

            if (price > 0) {
                const productdata = {
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price,
                    category: req.body.category,
                    image:req.files.map(file=>file.filename),
                    stock: req.body.stock,
                    OfferPrice:req.body.offerprice,
                    Discount:req.body.discount,
                };
               
                await productcollection.insertMany([productdata]);
                res.redirect('/admin/products');
            } else {
                res.redirect('/admin/products/add');
            }
        }
    } catch (error) {
        console.log(error);
    }
};


const deleteProduct=async(req,res)=>{
    try{
        const id=req.params.id;
        const result= await productcollection.findByIdAndUpdate(id,{isDeleted: false });
        if(result){
            res.redirect('/admin/products')
        }else{
            console.log('product not found')
        }
    }catch(error){
        console.error('Error deleting user:',error)
    }
}

const undeleteProduct=async(req,res)=>{
    try{
        const id=req.params.id;
        const result= await productcollection.findByIdAndUpdate(id,{isDeleted: true });
        if(result){
            res.redirect('/admin/products')
        }else{
            console.log('product not found')
        }
    }catch(error){
        console.error('Error deleting user:',error)
    }
}

const editProduct=async(req,res)=>{
    try{

    
    let id = req.params.id;
   
    const errorMessage=''
    productcollection.findById(id)
    .then(product=>{
        console.log('proid:',product._id)
        if(!product){
            res.redirect('/admin/products')
        }else{
            res.render('editproducts',{product,errorMessage})
        }
    })
    .catch(error =>{
        console.log("Error in finding the products : ", error);
        res.redirect('/admin/products')
    })
}catch(error){
    console.error('Error editing user:',error)

}
}

const updateProduct = async (req, res) => {
    try {
        const enteredProductName = req.body.name.toLowerCase();
        let id = req.params.id;
        const product=await productcollection.findById(id)
        let imageFiles = [];
        if (req.files) {
            imageFiles = req.files.map(file => file.filename);
        }

        const existingProduct = await productcollection.findOne({
            $and: [
                { name: { $regex: new RegExp('^' + enteredProductName + '$', 'i') } },
                { _id: { $ne: id } }
            ]
        });

        console.log('Existing Product:', existingProduct);

        if (existingProduct) {
            console.log('Product with the same name already exists');
            res.render('editproducts',{product,errorMessage:'product Already Exist'}) // You may want to handle this case differently
        } else {
            const productData = {
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                category: req.body.category,
                ...(imageFiles.length > 0 && { image: imageFiles }),
                stock: req.body.stock,
                OfferPrice: req.body.offerprice,
                Discount: req.body.discount,
            };

            console.log(productData);
            const result = await productcollection.findByIdAndUpdate(id, productData);

            if (!result) {
                console.log('Product not found');
            } else {
                res.redirect('/admin/products');
            }
        }
    } catch (err) {
        console.log('Error updating the product: ', err);
        
    }
}




module.exports={
    productsLoad,
    addProduct,
    insertProduct,
    deleteProduct,undeleteProduct,
    editProduct,
    updateProduct,
}