const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
	const token =
		req.body.token || req.query.token || req.headers["x-access-token"];

	if (!token) {
		return res.send({
			error: "TRUE",
			message: "A token is required for authentication",
		});
	}
	try {
		const decoded = jwt.verify(token, config.JWT_KEY);
		req.user = decoded;
	} catch (err) {
		return res.send({ error: "TRUE", message: "Invalid Token" });
	}
	return next();
};

module.exports = verifyToken;
