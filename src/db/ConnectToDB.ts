import mongoose from 'mongoose';
import 'dotenv/config';

const TODO_DB_NAME: string = "todoApp";

const connectDB = async (): Promise<void> => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${TODO_DB_NAME}`);
        
        if (connectionInstance) {
            console.log("Db connect successfully");
        }

    } catch (error) {
        console.log("mongodb connection error", error);
        process.exit(1);
    }
}

export default connectDB;