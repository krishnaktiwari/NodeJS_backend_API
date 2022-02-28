require("dotenv").config();
require("./config/database").connect();

const auth = require("./middleware/auth");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const express = require("express");

// added by sampath
const mongoose = require("mongoose")
const crypto = require("crypto")
const multer = require("multer")
const path = require("path")
const {GridFsStorage} = require("multer-gridfs-storage")
const Grid = require("gridfs-stream")
// above added by sampath


const app = express();

const User = require("./model/user");

app.use(express.json());

app.get("/", function (req, res) {
	try {
	} catch (err) {
		res.send({ error: true, message: err.message });
	}
});

app.post("/auth/admin", async function (req, res) {
	try {
	} catch (err) {
		res.send({ error: true, message: err.message });
	}
});

app.post("/auth/user", async function (req, res) {
	try {
		const { email_id, password } = req.body;
		if (!(email_id && password)) {
			res.send({ error: "TRUE", message: "All input required" });
		}

		const user = await User.findOne({ email_id });

		if (user && (await bcrypt.compare(password, user.password))) {
			const token = jwt.sign(
				{
					user_id: user._id,
					email_id: user.email_id,
				},
				process.env.JWT_KEY,
				{
					expiresIn: "1h",
				}
			);
			res.send({
				error: "FALSE",
				message: "SUCCESS",
				user: user,
				token: token,
			});
		} else {
			res.send({ error: "TRUE", message: "Invalid user id" });
		}
	} catch (err) {
		res.send({ error: true, message: err.message });
	}
});

app.get("/user", auth, async function (req, res) {
	try {
		const user = await User.find();
		res.send({ error: true, message: "SUCCESS", user: user });
	} catch (err) {
		res.send({ error: true, message: err.message });
	}
});



// added by sampath
const mongoURI = process.env.MONGO_URI
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname)
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
const upload = multer({ storage });
// uploading images
app.post("/",upload.single("img"),(req,res)=>{
    res.json({file:req.file})
})

// above added by sampath





app.post("/user/create", async function (req, res) {
	try {
		const reqData = req.body;
		const email_id = reqData.email_id;
		const oldUser = await User.findOne({ email_id });

		if (oldUser) {
			res.send({ error: true, message: "Given email id already exist" });
		} else {
			reqData.password = await bcrypt.hash(reqData.password, 10);
			const user = await User.create(reqData);

			var transporter = nodemailer.createTransport({
				service: "gmail",
				auth: {
					user: "pradakshinaconsulting@gmail.com",
					pass: "scdmqxsizowmipsl",
				},
			});

			var mailOptions = {
				from: "info@pradakshina.in",
				to: reqData.email_id,
				subject: "Welcome",
				text: "Account created ...",
			};

			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log("Email sent: " + info.response);
				}
			});
			res.send({ error: false, message: "SUCCESS", user: user });
		}
	} catch (err) {
		res.send({ error: true, message: err.message });
	}
});

module.exports = app;
