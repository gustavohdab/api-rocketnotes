require("express-async-errors")
require("dotenv").config()

const migrationsRun = require("./database/sqlite/migrations")
const AppError = require("./utils/AppError")
const uploadConfig = require("./configs/upload")
const cors = require("cors")
const express = require("express")
const routes = require("./routes")

migrationsRun();

const app = express()
app.use(cors())
app.use("/files", express.static(uploadConfig.UPLOADS_FOLDER))
app.use(express.json())
app.use(routes)

app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    })
  }

  console.error(err)

  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  })
})

const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT} 🔥`);
});
