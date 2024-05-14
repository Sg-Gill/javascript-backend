import asyncHandler from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// this is a utility method
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    // what this validateBeforeSave props as false does is tell mongoose model to not validate
    // for the rest of the fields in the document before saving because we set the schema to always
    // ask for password this proper will tell i know what i am doing and just save

    user.save({ validateBeforeSave: false });
    // return an object with both tokens
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get data
  // validate data
  // check if user exists
  // check images
  // upload images
  // create user object - create entry in db
  // remove password and refresh token from response
  // check for user creation
  // send response

  const { fullName, email, userName, password } = req.body;

  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // can also pass whatever i want in the object
  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadFileOnCloudinary(avatarLocalPath);
  const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  // we chain select to get the fields from db and add -whatever the name to deselect
  // cause by default all are selected the _id is assigned by mongo to all objects added to it
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully!"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> get data and validate
  // get username, email,
  // check for user
  // password check
  // generate access and refresh token
  // send cookie response with tokens i.e secure cookie
  const { email, userName, password } = req.body;
  if (!(userName || email)) {
    throw new ApiError(400, "UserName or PassWord is required!");
  }

  const existingUser = await User.findOne({
    // or is a mongodb operator and there more like or/add
    $or: [{ userName, email }],
  });

  if (!existingUser) {
    throw new ApiError(404, "User does not exist");
  }

  // the method i gave to the model in schema only exist on the User (watch the caps)
  // instance that we got from the query i am using a method i assigned to the model during modelling

  const isPasswordValid = await existingUser.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // this method gives an object as response and we simple destructured as it came
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existingUser._id
  );

  // the reference of the existingUser we are using is old before adding the tokens
  // now we either make a db query to get the updated user or update the current object

  // +++ this updated the reference without query
  // existingUser.refreshToken = refreshToken;
  // existingUser.accessToken = accessToken;
  // +++

  // querying from db to get latest data

  const loggedInUser = await User.findById(existingUser._id).select(
    "-password -refreshToken"
  );

  // these options make the cookie non modfiable from anywhere except the server httpOnly is the one doing it
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      // even tho we set cookie we sent the tokens again as best practice because user might
      // need em for localstorage or mobile device that cant store cookies
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    // we pass the new key to get the updated
    // value from the query otherwise it will give me old value which contains the refreshtoken
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

export { registerUser, loginUser, logoutUser };
