const {Router} = require ('express');
const authRouter = Router ();
const authController = require ('../controllers/auth.controller');
const authMiddleware = require ('../middlewares/auth.middleware');
/** 
 * @route POST /api/auth/register
 * @description Register a user
 * @access public
 */
authRouter.post ('/register', authController.registerUserController);

/** 
 * @route POST /api/auth/login
 * @description Login a user
 * @access public
 */
authRouter.post ('/login', authController.loginUserController);

/** 
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add the token to blacklist
 * @access private
 */
authRouter.get ('/logout', authMiddleware.authUser, authController.logoutUserController);

/**
 * @route GET /api/auth/get-me
 * @description Get the current logged in user details
 * @access private
  */

authRouter.get (
  '/get-me',
  authMiddleware.authUser,
  authController.getMeController
);

// Export auth router
module.exports = authRouter;
