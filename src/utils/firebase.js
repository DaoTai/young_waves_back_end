import {
   getStorage,
   ref,
   getDownloadURL,
   uploadBytesResumable,
   deleteObject,
} from "firebase/storage";
import firebase from "../config/firebase/config.js";
const storage = firebase.storage();

export const storageAttachment = async (file) => {
   const now = new Date().toISOString();
   const storageRef = ref(storage, `images/${now}-${file.originalname}`);
   const metadata = {
      contentType: file.mimetype,
   };
   // Upload the file in the bucket storage
   const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
   //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel
   // Grab the public url
   const downloadURL = await getDownloadURL(snapshot.ref);

   return downloadURL;
};

export const storageAttachments = async (files) => {
   const urls = [];
   // Ko sử dụng forEach để xử lý bất đồng bộ được
   for (const file of files) {
      // Upload to firebase cloud
      const downloadUrl = await storageAttachment(file);
      urls.push(downloadUrl);
   }
   return urls;
};

// Xoá một ảnh trên Firebase Storage
export const deleleteAttachment = async (url) => {
   const storage = getStorage();

   // Create a reference to the file to delete
   const desertRef = ref(storage, url);
   // Delete the file

   try {
      await deleteObject(desertRef);
   } catch (err) {
      console.log("Error ", err);
   }
};

// Xoá nhiều ảnh trên Firebase Storage
export const deleleteAttachments = async (urls) => {
   for (const url of urls) {
      await deleleteAttachment(url);
   }
};
