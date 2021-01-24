const path = require('path');
const express =require("express");
const mongoose =require("mongoose");
const cors =require("cors");
const badyParser =require("body-parser");
const cookieParser =require("cookie-parser");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const storiesRoutes = require("./routes/stories");

const app = express();

require("dotenv").config();
//middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(badyParser.urlencoded({extended : true}));
app.use(cookieParser());
app.get('/',(req,res)=>{res.send("hillo")})

//server port
const port = process.env.PORT || 8888;

//connect to database
const connectToDatabase = async()=>{
   try{
      await mongoose.connect(process.env.DATABASE_URL,{
         useCreateIndex:true,
         useNewUrlParser:true,
         useUnifiedTopology:true,
         useFindAndModify:false
      });
      console.log("connect to db")
   }catch(err){
      console.log(err)
   }
}

connectToDatabase();

//use routes
app.use("/",userRoutes);
app.use("/",postRoutes);
app.use("/",storiesRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
   // Set static folder
   app.use(express.static('Social-NetWork-mern-Frontend/build'));
 
   app.get('*', (req, res) => {
     res.sendFile(path.resolve(__dirname, 'Social-NetWork-mern-Frontend', 'build', 'index.html'));
   });
 }

//start port
app.listen(port,(err)=>{
   err ? console.log(err)
   : console.log(`connect port :${port}`);
})