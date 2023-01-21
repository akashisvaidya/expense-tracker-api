import UserSchema from "./UserSchema.js";

export const getUserByEmail = (email) => {
  return UserSchema.findOne({ email });
};

export const createUser = (userData) => {
  return UserSchema(userData).save();
};

export const getUser = (userData) => {
  return UserSchema.findOne(userData);
};

export const getUserById = (userId) => {
  return UserSchema.findById(userId);
};
export const updateUserInfo = (userId, userData) => {
  return UserSchema.findOneAndUpdate(userId, userData, { new: true });
};
