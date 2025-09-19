

export const response = (res, statusCode, { success = true, data = null, message, errorType = null }) => {
    return res.status(statusCode).json({
        success,
        data,
        message,
        errorType
    })
}
