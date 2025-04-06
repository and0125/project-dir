import mongoose from "mongoose";

let initialized = false;

export async function Connect() {
  mongoose.set("strictQuery", true);

  if (initialized) {
    console.log("MongoDB already connected");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "nextjs-auth-clerk-demo",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
    initialized = true;
  } catch (error) {
    console.log("MongoDB connection error: ", error);
  }
}
