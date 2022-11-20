# Angular 8 File Uploader 

A File uploader app built with Angular 8 and Node.js backend.


## How to get started

 1. Clone the repo `git clone git@github.com/isaccanedo/angular-nodejs-file-uploader.git`
 2. Open a terminal and go to the **server** directory and install dependencies by the command `npm i` and start the server using `npm start`
 3. Open another new terminal and go to the **client** directory and install dependencies by the command `npm i` and start the app using `ng serve` (app will be then avilabale on `https://localhost:4200`)
 4. uploaded files will be stored at `./server/public` folder


## Features

 - Multiple files upload
 - Drag and drop files upload
 - Show upload progress for each file
 - **Resumable** file upload feature for previous partialy uploaded files
 - Cancel ongoing file upload
 - Indication of pending  uploads
 - Indication of finished uploads
 - Maximum 5 files will be uploaded at a time
