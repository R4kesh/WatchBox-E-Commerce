const collection = require("../model/userdb");
const productcollection=require('../model/productdb');
const categorycollection = require("../model/categorydb");



const adminLog=async(req,res)=>{
    if(req.session.admin){
        // const users=await collection.find()
        // const message1 = req.session.message1
        res.render('index')
    }else{
        // req.session.message1 = {
        //     type : 'success',
        //     message : 'Registration successfull'
        // }
        res.render('adminlogin')
    }
}


//admin credential
const adEmail='admin@gmail.com';
const adPassword='123';

const adminHome=async(req,res)=>{

    if(req.body.email==adEmail&&req.body.password==adPassword){
        req.session.admin=req.body.email
        res.redirect('/admin')
    }else{
        res.render('adminlogin',{error:'Invalid Credential'})
    } 
}

const usersLoad=async(req,res)=>{
    const users = await collection.find()
    res.render('users',{users})
}

// const deleteUser=async(req,res)=>{
//     try{
//         const id=req.params.id;
//         const result= await collection.findByIdAndRemove({_id:id});
//         if(result){
//             res.redirect('/admin/users')
//         }else{
//             console.log('product not found')
//         }
//     }catch(error){
//         console.error('Error deleting category:',error)
//     }
// }

const userBlock = async (req, res) => {
    try {
      const id = req.params.id;
      const user = await collection.findByIdAndUpdate(id, { blocked: true });
  
      if (!user) {
        res.status(400).json({ error: 'User not found or could not be blocked' });
      }
     
      res.redirect('/admin/users');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const userUnblock = async (req, res) => {
    try {
      const id = req.params.id;
      const user = await collection.findByIdAndUpdate(id, { blocked: false });
  
      if (!user) {
        res.status(400).json({ error: 'User not found or could not be unblocked' });
      } 
      res.redirect('/admin/users');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };








const productsLoad = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Get the requested page number
    const perPage = 4; // Number of products per page

    try {
        const totalProducts = await productcollection.countDocuments(); // Total number of products

        const products = await productcollection
            .find()
            .skip((page - 1) * perPage) // Skip the products that come before the requested page
            .limit(perPage); // Limit the number of products per page

        res.render('products', {
            products,
            currentPage: page,
            pages: Math.ceil(totalProducts / perPage) // Calculate total pages
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const addProduct=async(req,res)=>{
    const error="";
    res.render('addproducts',{error})
}

// const insertProduct=async(req,res)=>{
//     try{
//         const price = Number(req.body.price);
//         if (price > 0) {

//     const productdata={
//         name:req.body.name,
//         description:req.body.description,
//         price:req.body.price,
//         category:req.body.category,
//         image:req.file.filename,
//         stock:req.body.stock,
//     }
//     await productcollection.insertMany([productdata])
//     res.redirect('/admin/products')
// }else{
    
//     res.redirect("/admin/products/add")
// }


//     }catch(error){
//         console.log(error)
//     }


// }
///////////////////////////////////////////////////

const insertProduct = async (req, res) => {
    try {
        const enteredProductName = req.body.name.toLowerCase();

        // Check if the product already exists (case insensitive)
        const existingProduct = await productcollection.findOne({
            name: { $regex: new RegExp('^' + enteredProductName + '$', 'i') }
        });

        if (existingProduct) {
            res.render('addproducts', { error: 'Product already exists' });
        } else {
            const price = Number(req.body.price);

            if (price > 0) {
                const productdata = {
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price,
                    category: req.body.category,
                    image: req.file.filename,
                    stock: req.body.stock,
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
        const result= await productcollection.findByIdAndRemove({_id:id});
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
    let id = req.params.id;
    productcollection.findById(id)
    .then(product=>{
        if(!product){
            res.redirect('/admin/products')
        }else{
            res.render('editproducts',{product:product})
        }
    })
    .catch(error =>{
        console.log("Error in finding the products : ", error);
        res.redirect('/admin/products')
    })
}

const updateProduct=async(req,res)=>{
    try{
        let id = req.params.id;
        const result = await productcollection.findByIdAndUpdate(id, {
            name:req.body.name,
            description:req.body.description,
            price:req.body.price,
            category:req.body.category,
            image:req.file.filename,
            stock:req.body.stock,
        })
        if(!result){
            console.log('not found')
        }else{
          res.redirect('/admin/products')  
        }
    }catch(err){
        console.log('Error updating the product : ',err);
        
    }
}

const categoryLoad=async(req,res)=>{
   
    const category=await categorycollection.find()
    res.render('category',{category})
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
        if (existingCategory) {
            
            res.render('addcategory', { error: 'Category already exists' });
        } else {
            const categorydata={
                category:req.body.category,
                description:req.body.description,
            }
            console.log(categorydata);
            await categorycollection.insertMany([categorydata]);
            res.redirect('/admin/category');
        }
    }catch(error){
        console.log(error)
    }
    
}


const editCategory=async(req,res)=>{
    let id=req.params.id;
    categorycollection.findById(id)
    .then(category=>{
        if(!category){
            res.redirect('/admin/category')
        }else{
            res.render('editcategory',{category:category})
        }
    })
    .catch(error =>{
        console.log("Error in finding the Category : ", error);
        res.redirect('/admin/category')
    })
}

const updateCategory=async(req,res)=>{
    try{
    let id=req.params.id;
    const result=await categorycollection.findByIdAndUpdate(id,{
        category:req.body.category,
        description:req.body.description
    })
    if(!result){
        console.log('not found')
    }else{
      res.redirect('/admin/category')  
    }
}catch(err){
    console.log('Error updating the categorry : ',err);
}
}


const deletecategory=async(req,res)=>{
    try{
        const id=req.params.id;
        const result= await categorycollection.findByIdAndRemove({_id:id});
        if(result){
            res.redirect('/admin/category')
        }else{
            console.log('product not found')
        }
    }catch(error){
        console.error('Error deleting category:',error)
    }
}

const ordersLoad=async(req,res)=>{
    const user=await collection.find({orders:{$exists:true,$ne:[]}}).populate('orders.product');
    console.log('uuu',user)
    res.render('orders',{orderItems: user.orders,user})
}






const adminLogout=async(req,res)=>{
    req.session.destroy(function (err) {
        if (err) {
          console.log(err);
          res.redirect("/admin")
        } else {
          console.log("logout successful");
          res.status(200)
          res.redirect('/admin')
        }
      });
}







module.exports={
    adminLog,adminHome,usersLoad,
    categoryLoad,productsLoad,
    addProduct,insertProduct,deleteProduct,
    editProduct,updateProduct,adminLogout,
    insertCategory,addcategory,editCategory,
    updateCategory,deletecategory,userBlock,userUnblock,
    ordersLoad
    
}