
export const errorHandler = (er, req, res, next) => {
  const { error, err } = er;
  if (error) console.error('Err: ', error)
  console.error('❌ Error Stack :', err.stack || err);

  // Set default values
  let statusCode;
  // if(res.statusCode){
  //   statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  // }else if(err.statusCode){
    statusCode = err.statusCode && err.statusCode !== 200 ? err.statusCode : 500;
  // }
  // console.log(res.statusCode, err.statusCode)

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error,
    // Include stack trace only in development
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};


export function createError(statusCode,error, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return {error, err};
}
