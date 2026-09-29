const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    data: null,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

module.exports = notFound;
