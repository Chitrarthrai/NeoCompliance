const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const inspectorSchema = new Schema(
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
      enum: ["manager", "associate", "inspector"],
      default: "inspector",
    },
    assigned_stores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const SALT_FACTOR = 10;

inspectorSchema.pre("save", function (done) {
  const inspector = this;
  if (!inspector.isModified("password")) return done();

  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) return done(err);
    bcrypt.hash(inspector.password, salt, (err, hashedPassword) => {
      if (err) return done(err);
      inspector.password = hashedPassword;
      return done();
    });
  });
});

inspectorSchema.pre("updateOne", function (done) {
  const update = this.getUpdate();
  if (!update.password) return done();
  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) return done(err);
    bcrypt.hash(update.password, salt, (err, hashedPassword) => {
      if (err) return done(err);
      update.password = hashedPassword;
      return done();
    });
  });
});

module.exports = mongoose.model("Inspector", inspectorSchema, "inspectors");
