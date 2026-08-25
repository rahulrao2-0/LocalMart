import mongoose from "mongoose";

const connectDB = async () => {
    while (true) {
        try {
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 5000,
            });

            console.log("MongoDB connected successfully");
            break;

        } catch (error) {
            console.error(
                "MongoDB connection failed: " + error.message
            );

            console.log("Retrying in 5 seconds...");

            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

export default connectDB;
