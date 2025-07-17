const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 25,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Enter Email Address"],
      unique: [true, "Email Already Exist"],
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "{VALUE} is not a valid email",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["manager", "associate"],
      default: "employee",
    },
  },
  {
    timestamps: true,
  }
);

const SALT_FACTOR = 10;


userSchema.pre("save", function (done) {
  const user = this;
  if (!user.isModified("password")) return done();

  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) {
      console.log(err);
      return done(err);
    }
    bcrypt.hash(user.password, salt, (err, hashedPassword) => {
      if (err) return done(err);
      user.password = hashedPassword;
      return done();
    });
  });
});


userSchema.pre("updateOne", function (done) {
  const user = this.getUpdate();
  if (!user.password) return done();
  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) return done(err);
    bcrypt.hash(user.password, salt, (err, hashedPassword) => {
      if (err) return done(err);
      user.password = hashedPassword;
      return done();
    });
  });
});

module.exports = new mongoose.model("User", userSchema, "users");