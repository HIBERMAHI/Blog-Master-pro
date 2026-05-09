const mongoose = require("mongoose");
const passportLocalMongoose =
  require("passport-local-mongoose").default ||
  require("passport-local-mongoose");

const registrationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    required: true,
  },
  lastName: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
  },
//   password: {
//     type: String,
//     trim: true,
//     required: true,
//   },
  role:{
    type:String,
    trim: true,
    required:true,
    enum: ['admin', 'user']
  }
});

registrationSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("Registration", registrationSchema);
