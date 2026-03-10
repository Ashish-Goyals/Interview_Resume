const userModel = require ('../models/user.model');
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');
const blackListModel = require ('../models/blackList.model');
/**
 * Description placeholder
 *
 * @name registerUserController
 * @description register a new user expects username, email and password in the request body
 * @access Public
 */
async function registerUserController (req, res) {
  try {
    const {username, email, password} = req.body;

    if (!username || !email || !password) {
      return res.status (400).json ({
        success: false,
        message: 'All fields are required',
      });
    }

    if (password.length < 6) {
      return res.status (400).json ({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const existingUser = await userModel.findOne ({
      $or: [{username}, {email: email.toLowerCase ()}],
    });

    if (existingUser) {
      return res.status (400).json ({
        success: false,
        message: 'Username or email already taken',
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash (password, 10);

    // 4. Create user
    const newUser = new userModel ({
      username,
      email: email.toLowerCase (),
      password: hashedPassword,
    });

    // 5. Save user first
    await newUser.save ();

    // 6. Generate token AFTER save
    const token = jwt.sign ({userId: newUser._id}, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // 7. Set secure cookie
    res.cookie ('token', token);

    return res.status (201).json ({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error ('Error in registerUserController:', error);
    return res.status (500).json ({
      success: false,
      message: 'Server error',
    });
  }
}

/**
 * Description placeholder
 *
 * @name loginUserController
 * @description login a user expects email and password in the request body
 * @access Public
 */

async function loginUserController (req, res) {
  const {email, password} = req.body;

  if (!email || !password) {
    return res.status (400).json ({
      success: false,
      message: 'All fields are required',
    });
  }

  const user = await userModel
    .findOne ({email: email.toLowerCase ()})
    .select ('+password');

  if (!user) {
    return res.status (400).json ({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const isMatch = await bcrypt.compare (password, user.password);

  if (!isMatch) {
    return res.status (400).json ({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const token = jwt.sign ({userId: user._id}, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  res.cookie ('token', token);

  return res.status (200).json ({
    success: true,
    message: 'User logged in successfully',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}



/** 
 * @name logoutUserController
 * @description clear token from user cookie and add the token to blacklist
 * @access private
 */
async function logoutUserController (req, res) {
  try {
    const token = req.cookies?.token;
    if (token) {
      await blackListModel.create ({token});
    }

    res.clearCookie ('token');
    return res.status (200).json ({
      success: true,
      message: 'User logged out successfully',
    });
  } catch (error) {
    console.error ('Error in logoutUserController:', error);
    return res.status (500).json ({
      success: false,
      message: 'Server error',
    });
  }
}

/**
 * @name getMeController
 * @description Get the current logged in user details.
 * @access private
 */

async function getMeController (req, res) {
  try {
    const user = await userModel.findById (req.user.userId).select (
      '-password'
    );
    if (!user) {
      return res.status (404).json ({
        success: false, 
        message: 'User not found',
      });
    }
    return res.status (200).json ({
      success: true,
      message:" User details fetched successfully",
      user:{
        id: user._id,
        username: user.username,
        email: user.email
      },
    });
  } catch (error) {
    console.error ('Error in getMeController:', error);
    return res.status (500).json ({
      success: false,
      message: 'Server error',
    });
  }
} 


module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
};
