import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"

const app = express()

const PORT = process.env.PORT || 8000

// Connect monogo db
import { connectDB } from "./src/config/db.js"
connectDB()

// Middlewares
app.use(express.json())
app.use(cors())

// Global error handler
app.use((error, req, res, next) => {
  console.log(error.message)

  const errorCode = error.errorCode || 500
  res.status(errorCode).json({
    status: "error",
    message: error.message,
  })
})

// Api routes
import userRouter from "./src/routers/userRouter.js"
import bookRouter from "./src/routers/bookRouter.js"
import transactionRouter from "./src/routers/transactionRouter.js"
import { isAuth } from "./src/middlewares/authMiddleware.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/book", isAuth, bookRouter)
app.use("/api/v1/transaction", isAuth, transactionRouter)

// All uncaught request
app.use("*", (req, res) => {
  res.json({
    message: "System status is healthy",
  })
})

// Run the server
app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`Server is running at http://localhost:${PORT}`)
})
