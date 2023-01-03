import mongoose from "mongoose";

const connect = async () => {
   try {
      mongoose.set("strictQuery", false);
      mongoose.connect(process.env.MONGODB_URL);
      console.log("Connect database successfully!");
   } catch (err) {
      console.log("Connect database failed!");
   }
};
export default connect;
