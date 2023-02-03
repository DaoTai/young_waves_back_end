<!-- Database -->

# User

-  username: { type: String, required: true, minLength: 3, maxLength: 15, unique: true },
-  password: { type: String, minLength: 6, required: true },
-  isAdmin: { type: Boolean, default: false },
-  fullName: { type: String, minLength: 6, required: true },
-  region: { type: String },
-  address: { type: String, minLength: 6, maxLength: 35 },
-  dob: { type: String, minLength: 8 },
-  gender: { type: String, enum: ["male", "female", "others"], required: true },
-  email: { type: String, minLength: 12, maxLength: 35 },
-  avatar: { type: String, default: "" },

# Post

{

-  author: {
   type: mongoose.Types.ObjectId,
   ref: "user",

-  },
   status: {
   type: String,
-  },
   body: {
   type: String,
   maxLength: 10000,
   required: true,
-  },
   likes: [{ type: mongoose.Types.ObjectId, ref: "like" }],
   comments: [{ type: mongoose.Types.ObjectId, ref: "comment" }],
   attachment: [{ type: String }],
-  },
   {
   timestamps: true,
   }

# Comment

{

-  user: {
   type: mongoose.Types.ObjectId,
   ref: "user",

-  },
   post: {
   type: mongoose.Types.ObjectId,
   ref: "post",
-  },
   body: {
   type: String,
   maxLength: 10000,
   required: true,
-  },
-  },
   {
   timestamps: true,
   }

# Like

{

-  author: {
   type: mongoose.Types.ObjectId,
   ref: "user",
   required: true,
   },
-  post: {
   type: mongoose.Types.ObjectId,
   ref: "post",
   required: true,
   },
   },
-  {
   timestamps: true,
   }
