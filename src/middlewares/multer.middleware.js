import multer from "multer";
import * as path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // creating unique suffix like id.png etc it is important when two images of the same name are uploaded by the user
    const ext = path.extname(file.originalname); // Get file extension
    const baseName = path.basename(file.originalname, ext); // Get base file name
    const uniqueName = `${baseName}-${Date.now()}${ext}`; // Add timestamp to filename
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // cb(null, file.fieldname + "-" + uniqueSuffix);
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });

// custom function for creating path - start

// function customDestination(req, file, cb) {
// Determine the destination directory dynamically based on request or file properties
// For example, you might use the user ID from the request to create a user-specific folder
//   const userId = req.user.id; // Assuming you have a user object attached to the request
//   const destination = "/uploads/" + userId;

// Create the directory if it doesn't exist
// we give recursive true to make sure all parent directories are created if we dont do that
// files/upload/images only image will be created if we dont do recursive true
//   fs.mkdir(destination, { recursive: true }, (err) => {
//     if (err) {
//       return cb(err);
//     }
//     // Pass null as the first parameter if there's no error
//     cb(null, destination);
//   });
// }

// const storage = multer.diskStorage({
//     destination: customDestination,
//     filename: function(req, file, cb) {
//         // Define how you want to name the file
//         // This function receives req, file, and a callback function (cb)
//         // Your code here
//     }
// });

// custom function for creating path - end
