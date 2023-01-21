import mongoose, { Schema } from "mongoose"

const bookSchema = new mongoose.Schema(
  {
    isbn: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    borrowedBy: [{ type: Schema.Types.ObjectId, ref: "users" }],
  },
  {
    timestamps: true,
  }
)

export default mongoose.model("Book", bookSchema)
