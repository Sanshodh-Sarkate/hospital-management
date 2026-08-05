const errorMiddleware =  (err ,  req , res ,  next) => {
    const stausCode   = err.stausCode  || 500 ;
    const status  =  err.status  ||  'error';

    return  res.status(stausCode ).json({
        success: false,
        status: status,
          message: err.message || "Internal Server Error",
    });
}

module.exports =  errorMiddleware;