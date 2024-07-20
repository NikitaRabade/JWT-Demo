import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { urlencoded } from "body-parser";

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN, //which origin means frontend is allowed to talk with backend
    credentials : true
}));

app.use(express.json({limit : "16kb"}));

app.use(urlencoded({extended : true, limit : "16kb"}));

app.use(express.static("public"));

app.use(cookieParser);

export { app };