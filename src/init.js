import "regenerator-runtime";
import "dotenv/config";
import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import app from "./server";

const PORT = porcess.env.PORT || 4000;

const handleListening = () => console.log(`Server listening on port ${PORT}👍`);

app.listen(PORT, handleListening);
