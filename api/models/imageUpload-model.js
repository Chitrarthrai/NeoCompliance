const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageUploadSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    section_no: {
      type: Number,
      required: true,
    },
    questionId: {
      type: Number,
      required: true,
    },
    filePath: {
      type: String, // store blob name like "responses/media_12345.jpeg" or ".mp4"
      required: true,
    },
    fileType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ImageUpload", ImageUploadSchema);
