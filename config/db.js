const mongoose=require('mongoose')
mongoose.connect(process.env.DBConnectionstring).then(res=>{
    console.log("Mongodb connected.....");
    
})
.catch(err=>{
    console.log("mongodb connection error",+err);
    
})