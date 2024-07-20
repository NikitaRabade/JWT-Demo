//using promise
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise
        .resolve(requestHandler(req, res, next))
        .catch((err) => next(err));
    }
};

export {asyncHandler};


/*
1. to deaclre function : 
    const asyncHandler = () => {}
2. Make higher order function
    const asyncHandler = (func) => {() => {}}  
    OR
    const asyncHandler = (func) => () => {}  
    means  same as

    a function takes function as argument and also return function as result

    function asyncHandler(fn) {
            return () => { };
        }
3. to make asynchronous function =>  It is designed to wrap an async function to handle errors gracefully by passing them to the next middleware.
    const asyncHandler = (func) => async () => {}  
*/

/*Using try catch  */
/*
const asyncHandler = (func) => async (req, res, next) => {
    try{
        await func(req, res, next);
    }catch(error){
        res.status(err.code || 500).json({
            success : false,
            message : err.message
        });
    }
}  
    */