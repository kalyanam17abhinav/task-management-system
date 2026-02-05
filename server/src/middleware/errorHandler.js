export const errorHandler = (err, req, res, next) => {
    console.error(err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "internal server error";

    res.status(statusCode).json({
        success: false,
        message
    });
};