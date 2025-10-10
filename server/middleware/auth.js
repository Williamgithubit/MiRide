import jwt from "jsonwebtoken";
import db from "../models/index.js";

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const auth = (roles = []) => {
  return async (req, res, next) => {
    console.log('AuthMiddleware - Request received:', {
      method: req.method,
      path: req.path,
      headers: {
        authorization: req.headers.authorization ? '***token present***' : '***no token***',
        ...req.headers
      },
      requiredRoles: roles
    });

    try {
      // Extract token from header
      const authHeader = req.header("Authorization");
      console.log('AuthMiddleware - Raw Authorization header:', authHeader);
      
      const token = authHeader?.replace(/^Bearer\s+/i, '');
      
      console.log('AuthMiddleware - Extracted token:', token ? '***token present***' : '***no token***');

      if (!token) {
        console.log('AuthMiddleware - No token found in Authorization header');
        return res.status(401).json({ message: "No token, authorization denied" });
      }

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
        if (process.env.NODE_ENV !== "production") {
          console.log("AuthMiddleware - Token decoded:", {
            id: decoded.id,
            role: decoded.role,
          });
        }
      } catch (verifyError) {
        console.error("AuthMiddleware - jwt.verify error:", verifyError);
        return res.status(401).json({ message: "Invalid token" });
      }

      // Find user
      console.log('AuthMiddleware - Looking up user with ID:', decoded.id);
      const user = await db.User.findByPk(decoded.id);
      
      if (!user) {
        console.log('AuthMiddleware - User not found with ID:', decoded.id);
        return res.status(401).json({ message: "User not found" });
      }
      
      if (!user.isActive) {
        console.log('AuthMiddleware - User account is inactive:', user.id);
        return res.status(401).json({ message: "User account is inactive" });
      }

      // Check roles if any roles are required
      if (roles.length > 0) {
        console.log('AuthMiddleware - Checking user role:', {
          userRole: user.role,
          requiredRoles: roles,
          hasRequiredRole: roles.includes(user.role)
        });
        
        if (!roles.includes(user.role)) {
          console.warn(`AuthMiddleware - Insufficient role. Required: ${roles.join(', ')}, user role: ${user.role}`);
          return res.status(403).json({ 
            message: "Insufficient permissions",
            requiredRoles: roles,
            userRole: user.role
          });
        }
      } else {
        console.log('AuthMiddleware - No specific role required, allowing access');
      }

      req.user = user;
      req.userId = user.id; // For compatibility with existing controllers
      next();
    } catch (error) {
      console.error("Auth error:", error);
      res.status(401).json({ message: "Invalid token" });
    }
  };
};

export default auth;
