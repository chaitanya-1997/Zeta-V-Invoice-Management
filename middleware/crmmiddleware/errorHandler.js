// Catch-all error handler. Put this LAST in server.js after all routes.
module.exports = (err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  console.error(err.stack);

  res.status(err.status || 500).json({
    message: err.message || "Something went wrong on the server",
  });
};
