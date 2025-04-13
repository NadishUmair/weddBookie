const jwt = require("jsonwebtoken");



const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing from header' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const role = decoded.role;
    if (role !== 'host' && role !== 'vendor' && role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized role access" });
    }

    req.role = role;
    req.user = decoded; // optional, gives access to entire payload
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please log in again.' });
    } else {
      console.error(error);
      return res.status(500).json({ message: 'Failed to authenticate. Please try again later.' });
    }
  }
};




const checkForgetToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: 'Token missing from header' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId=decoded.id;
        console.log("User ID from token:", req.userId); 
        // If successful, return success message
        next();

    } catch (error) {
        // If token is expired
        console.error("Token verification failed:", error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        }

        // If token is invalid
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Generic error fallback
       
        return res.status(500).json({ message: 'Token verification failed' });
    }
};


module.exports={checkForgetToken,authenticateToken};