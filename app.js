
require('dotenv').config();
const express=require('express');
const cors=require("cors");
const connectDB = require('./db/connDb');
const HostRoutes=require('./routes/hostRoutes');
const VendorRoutes=require('./routes/vendorRoutes');

const port=process.env.PORT;
const app=express();
app.use(cors());
app.use(express.json());
connectDB();



app.use("/api/v1/host",HostRoutes);
app.use("/api/v1/vendor",VendorRoutes);


app.listen(port,()=>{
    console.log("app is running at port",port);
})