const logger = require('./logger');

module.exports = (code, message, data, res) => {
	// logger.info("Response:", { code, message, data });
	res.statusCode = code;
	res.statusMessage = message;
	return res.json({ code, message, data });
};
