import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";
const userSchema = new mongoose.Schema(
   {
      username: { type: String, required: true, minLength: 3, maxLength: 15, unique: true },
      password: { type: String, minLength: 6, required: true },
      isAdmin: { type: Boolean, default: false },
      fullName: { type: String, minLength: 6, required: true },
      region: { type: String },
      address: { type: String, minLength: 6, maxLength: 35 },
      dob: { type: String, minLength: 8 },
      gender: { type: String, enum: ["male", "female", "others"], required: true },
      email: { type: String, minLength: 12, maxLength: 35 },
      avatar: { type: String, default: "" },
   },
   {
      timestamps: true,
   }
);

userSchema.plugin(mongooseDelete, { overrideMethods: true, deletedAt: true });
const UserModel = mongoose.model("user", userSchema);
export default UserModel;
