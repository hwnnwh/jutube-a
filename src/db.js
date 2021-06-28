import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

mongoose.set("useCreateIndex", "true");

const db = mongoose.connection;
const handleStart = () => console.log("DB connected👍");
const handleError = (error) => console.log("DB error occured❗️", error);

db.on("error", handleError);
db.once("open", handleStart);
