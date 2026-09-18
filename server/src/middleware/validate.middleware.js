/**
 * Validation Result Middleware
 */
export const validateRequest = (validatorFn) => {
  return (req, res, next) => {
    if (typeof validatorFn === "function") {
      const error = validatorFn(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error,
        });
      }
    }
    next();
  };
};
