import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";
const userSchema = new mongoose.Schema(
   {
      username: { type: String, required: true, minLength: 6, maxLength: 15, unique: true },
      password: { type: String, minLength: 6, required: true },
      isAdmin: { type: Boolean, default: false },
      fullName: { type: String, minLength: 3, required: true },
      region: { type: String, minLength: 2 },
      city: { type: String, minLength: 2, maxLength: 35 },
      dob: { type: String, minLength: 2 },
      gender: { type: String, enum: ["male", "female", "other"], required: true },
      email: { type: String, minLength: 12, maxLength: 35 },
      avatar: { type: String, default: "" },
      coverPicture: { type: String },
      friends: [{ type: mongoose.Types.ObjectId, ref: "user", default: [] }],
   },
   {
      timestamps: true,
   }
);

userSchema.plugin(mongooseDelete, { overrideMethods: true, deletedAt: true });
const UserModel = mongoose.model("user", userSchema);
export default UserModel;
