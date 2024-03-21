import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.on("connectionError", (error) => {
      console.log("connection failed Err:", error);
      throw error;
    });
    app.listen(process.env.PORT || 8000);
    console.log(`server is running on pprt ${process.env.PORT ?? 8000}`);
  })
  .catch((err) => {
    console.log("MONGO Db connection failed ", err);
  });

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//   } catch (error) {
//     console.log("EROOR:", error);
//   }
// })();
