import dotenv from "dotenv";
import connectDB from "./db/dbConnection.js";
import { server } from "./app.js";

dotenv.config({
    path: './.env'
})

connectDB()
    .then(() => {
        server.listen(process.env.PORT || 5000, () => {
            console.log(`Server is running at port : ${process.env.PORT || 5000}`);
        })
    })
    .catch((err) => {
        console.log("MongoDB connection failed !!!", err)
    })