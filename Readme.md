## To start a set up : 
1. npm init
2. to store images public folder (whole) 
3. .gitignore (for ignoreing some file to upload on git) file created directly - content from git ignore generators
4. .env file
5. src folder created
6. from git bash -> create app.js, constants.js  index.js 
command = touch app.js, constants.js  index.js
7. changing type of importing in package.json
8. installing nodemon and change package.json  - > by adding dev in script
9. making folders under server
10. setting up app.js file
11.  to connect backend with frontend - cors npm package is used => cors is middleware
- to congiure cors : 
        app.use(cors({
            origin : process.env.CORS_ORIGIN, //which origin means frontend is allowed to talk with backend
            credentials : true
        }))

        .env :
        CORS_ORIGIN = *  //allowed from everywhere

12. import cookieParser from "cookie-parser"; => used as middleware to access and set cookies at user end. They secure and only accessible by server.
app.use(cookieParser);


## GitHub commands that used : 

1. git init : to initialize repository
2. git add . : add all files 
3. git commit : to save changes permanently
4. git branch -M main : to change branch from master to main
5. git remote add origin https://github.com/NikitaRabade/JWT-Demo.git : remote add for where to push files into repository
6. git push -u origin main : to set upstring and also use for push


## package.json :
There are two types of importing =>
- i] using import : import statement
- ii] using common js : require syntax

By Default it is require syntax 
Hence to change importing style to module based ::
- "type" : "module",


## Dotenv set up :
As we are using import style for importing. But problem is that dotenv currently support only for require() syntax hence we need to make some changes in package.json as experimental feature for dotenv =>

"scripts": {
    "dev": "nodemon -r dotenv/config --experimental-json-module src/index.js"
  },

- 1] nodemon:

nodemon is a utility that automatically restarts your Node.js application when it detects any changes in the source files. It helps in development by reducing the need to manually restart the server after making changes.

- 2] -r dotenv/config:

 The -r flag stands for require. It tells nodemon to require a module before starting the application.
dotenv/config is a module that loads environment variables from a .env file into process.env. This is useful for managing configuration variables in development without hardcoding them into your source code.


- 3] --experimental-json-module:

This flag enables experimental support for importing JSON files as ES modules. This means you can use import someData from './someData.json' syntax in your code, which is part of the newer ECMAScript module system.

- 4] src/index.js:

 This is the entry point of your application. nodemon will start and monitor this file, restarting the application whenever changes are detected in any of the files in your project.


## Connect Database :
connect() is used to connect DB

##  Building a Robust User Registration Flow in Node.js with Cloudinary Integration

1. Create wrapper for asynchronous operations beacause we use async syntax everytime. = asyncHanddler
2. Seting up ApiError and Apiresponse => refer mode js documentation for node js error
3. Demo try : make controller(handling code for particular route) -> router(defining endpoint and mapping endpoint to controller ) -> mapping in app.js (mapping of routers)
4. Defining register controller by considering following flow : 
    -  i]    get user details from frontend
    -  ii]   validation - not empty
    -  iii]  check if user already exists: username, email
    -  iv]   check for images, check for avatar
    -  v]    upload them to cloudinary, avatar
    -  vi]   create user object - create entry in db
    -  vii]  remove password and refresh token field from response
    -  viii] check for user creation
    -  ix]   return res

      - req.files having object of feilds :  {
      fieldname: 
      originalname: 
      encoding:
      mimetype: 
      destination: 
      filename: 
      path: 
      size: 
    }

    - cloudanary returns response json object : {
      public_id, width, height, url, secure_url,bytes, original_filename, format (jpg or png), created_at, resource_type,
      tags,
    }

## Comprehensive Guide to User Registration with Access and Refresh Tokens in Node.js 
A refresh token is saved both on the client side and server side (in the database). When the access token expires, the refresh token is used to renew it, preventing the need for frequent logins. To achieve this, we create an endpoint that matches the access token with the refresh token.
  - req body -> data
  - username or email 
  - find the user
      - if not give appropriate message and also suggest to redirect to register pages 
      - if present : password check
           - if not match -> give error mssage
           - if match -> generate access and refresh token 
           - send cookies -> token
## Implementing Secure Token Management with HTTP Cookies in Node.js :
- generate access token and refresh token , adding this methods to model =>
      jwt.sign() method is used for generating jwt token which takes 3 parameter payload, secretOrPrivateKey, options as json object that can be expiry time : 
          algorithm: Specifies the signing algorithm (default is HS256).
          expiresIn: Sets the expiration time (e.g., "1h", "2d").
          notBefore: Specifies the time before which the JWT must not be accepted (e.g., "2h" for 2 hours in the future).

- To verify JWT : Using jwt.verify()
      verify(token: string, secretOrPublicKey: jwt.Secret)

      Synchronously verify given token using a secret or a public key to get a decoded token token - JWT string to verify secretOrPublicKey - Either the secret for HMAC algorithms, or the PEM encoded public key for RSA and ECDSA. [options] - Options for the verification returns - The decoded token. 
          


## Critical Topics / Important Aspects: 
- express documention
- express listners
- process (given by express) / Management
