import { getUser } from "../models/User/UserModel.js"

export const isAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers

    const user = authorization ? await getUser({ _id: authorization }) : null

    user?._id ? next() : res.json({ status: "error", message: "Unauthorized" })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
