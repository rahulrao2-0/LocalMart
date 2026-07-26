import express from "express"
import cookieParser from "cookie-parser";

const app = express();
const port = 3000;

app.use(express.json())
app.use(cookieParser())

app.listen(port,()=>{
    console.log("auth-service Server is listing on port 3000");
})