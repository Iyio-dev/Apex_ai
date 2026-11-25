import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import { validateProductionConfig } from "./utils/productionConfig.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing. Add a strong secret to your .env file.");
    }

    validateProductionConfig(process.env);
    await connectDB();
    app.listen(PORT, () => {
      console.log(`APEX API is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("APEX startup failed. Verify database connectivity and environment configuration.");
    process.exit(1);
  }
};

startServer();
