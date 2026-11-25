import mongoose from "mongoose";
import AppError from "./AppError.js";

const validateObjectId = (id, fieldName = "ID") => {
  const isValid =
    id instanceof mongoose.Types.ObjectId ||
    (typeof id === "string" && mongoose.isObjectIdOrHexString(id));

  if (!isValid) {
    throw new AppError(`Invalid ${fieldName}.`, 400);
  }
};

export default validateObjectId;
