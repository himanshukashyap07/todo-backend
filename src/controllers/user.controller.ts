import z from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiErrorHandler.js";
import User, { type IUser } from "../models/User.model.js";
import { ApiResponse } from "../utils/apiResponseHandler.js";
import fs from "fs";
import path from "path";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Todo from "../models/Todo.model.js";

const genrateAccessAndRefershToken = async (userId: any) => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new apiError(404, "user not found in genrate access and refresh token");
        };
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });;
        return { accessToken, refreshToken };
    } catch (error: any) {
        throw new apiError(500, error || "internal server error in genrate access and refresh token");
    };
}

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    //get user data form req.body
    //validate user data
    //check if user already exists
    //create user and save in db
    //remove refresh token from response
    // chceck if user creation was successful
    //create a log table entry
    // send data to client
    const { username, email, password } = req.body;
    const validateUser = z.object({
        username: z.string().min(3).max(30),
        email: z.string().email().regex(/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/),
        password: z.string().min(6).max(100)
    });
    const validatedData = validateUser.parse({ username, email, password });

    if (!validatedData) {
        throw new apiError(400, "Invalid user data");
    };
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
        throw new apiError(400, "User already exists");
    };
    const newUser = new User(validatedData);

    const savedUser = await newUser.save();
    if (!savedUser) {
        return res.status(500).json(new apiError(500, "User creation failed"));
    };

    const createdUser = await User.findById(savedUser._id).select("-refreshToken");
    if (!createdUser) {
        throw new apiError(500, "internal server error in registering a user")
    };

    const logsDir = path.resolve(process.cwd(), "logs");
    fs.mkdirSync(logsDir, { recursive: true });
    const registerLogPath = path.join(logsDir, "userRegisterLogs.txt");
    fs.appendFileSync(registerLogPath, `User Registered: Email:${createdUser.email} and Username:${createdUser.username}  at ${new Date().toISOString()}\n`);

    return res.status(201).json(new ApiResponse(201, createdUser, "user created successfully"));
})


const loginUser = asyncHandler(async (req: Request, res: Response) => {
    //get user data form req.body
    //validate user data
    //check if user exists
    //check if password is correct
    //remove refresh token from response
    //create a log table entry
    // send data to client
    const { email, password } = req.body;
    const validateUser = z.object({
        email: z.string().email().regex(/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/),
        password: z.string().min(6).max(100)
    });
    const validatedData = validateUser.parse({ email, password });
    if (!validatedData) {
        throw new apiError(400, "Invalid user data");
    };
    const user: IUser = await User.findOne({ email: validatedData.email }).select("+password +refreshToken");
    if (!user) {
        throw new apiError(404, "User not found");
    };
    const isPasswordMatch = await user.isPasswordCorrect(validatedData.password);
    if (!isPasswordMatch) {
        return res.status(401).json(new apiError(401, "Invalid password"));
    };

    const { accessToken, refreshToken } = await genrateAccessAndRefershToken(user._id);

    const userData = await User.findById(user._id).select(" -password");
    if (!userData) {
        throw new apiError(500, "internal server error in loging a user")
    };

    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(200, userData, "user logged in successfully")
        )
});

const logOutUser = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    await User.findByIdAndUpdate(user?._id, {
        $unset: {
            refreshToken: 1
        }
    },
        {
            new: true,
        }
    );
    const options ={
        httpOnly:true,
        secure:true
    };
    // Ensure logs directory exists and append logout entry using absolute path
    const logsDir = path.resolve(process.cwd(), "logs");
    fs.mkdirSync(logsDir, { recursive: true });
    const logoutLogPath = path.join(logsDir, "userLogoutlogs.txt");
    fs.appendFileSync(logoutLogPath, `User Logged Out: Email:${user?.email} and Username:${user?.username}  at ${new Date().toISOString()}\n`);

    return res
    .status(200)
    .clearCookie("refreshToken",options)
    .clearCookie("accessToken",options)
    .json(new ApiResponse(200, {}, "user logout successfully"));

})
const getCurrentUser = asyncHandler(async (req:Request, res:Response) => {
    const user = req.user; 
    return res.status(200)
        .json(new ApiResponse(200,user,"user fetched successfully"));
})

const updateUserPassword = asyncHandler(async(req:Request,res:Response)=>{
    const user = req.user;
    const { oldPassword,newPassword } = req.body;
    const validatePassword = z.object({
        newPassword: z.string().min(6).max(100),
        oldPassword: z.string().min(6).max(100)
    });
    const validatedData = validatePassword.parse({oldPassword, newPassword });
    if (!validatedData) {
        throw new apiError(400, "Invalid password data");
    };
    if (validatedData.oldPassword === validatedData.newPassword) {
        
        throw new apiError(400, "oldpassword is equal to new password");
    }
    const getUser = await User.findById(user?._id).select("+password")
    
    const isCorrectPassword = await getUser?.isPasswordCorrect(validatedData.oldPassword)
    if (!isCorrectPassword) {
        throw new apiError(400, "oldpassword is not match to saved password");
    }

    await User.findByIdAndUpdate({
        _id: user?._id
    },{
        password: validatedData.newPassword
    },{
        new:true,
    });
    return res.status(200).json(new ApiResponse(200,{},"user password updated successfully"))
})

const getAllTodos = asyncHandler(async (req:Request,res:Response)=>{
    const user = req.user;
    const todos  = await Todo.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(user?._id)
            }
        }
    ]);
    if(!todos){
        throw new apiError(404,"todos not found for this user");
    };
    return res.status(200).json(new ApiResponse(200,todos,"todos fetched successfully"));
})

export {
    registerUser,
    loginUser,
    logOutUser,
    getCurrentUser,
    updateUserPassword,
    getAllTodos
};