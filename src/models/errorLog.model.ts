import mongoose, { Schema } from "mongoose";

const errorLogSchema = new Schema(
  {
    message: { type: String, required: true },
    statusCode: { type: Number, required: true },
    errorsMessage: { type: Array, default: [] },
    stack: { type: String },
    route: { type: String },
    method: { type: String },
    timestamp: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

export const ErrorLog = mongoose.model("ErrorLog", errorLogSchema);
