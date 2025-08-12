import { Request, Response, NextFunction } from "express";
export interface CustomRequest extends Request {
  user?: any;
}

const getToken = async (req: CustomRequest, res: Response): Promise<any> => {
  const token = (req.headers as any).authorization?.split(" ")[1]; // Get token from Authorization header
  // console.log("token", token);
  if (!token) {
    return res.status(400).send("Token is required");
  }

  res.cookie("token", token, {
    httpOnly: true, // Prevent access by client-side JavaScript
    secure: process.env.NODE_ENV === "production", // Ensure it's sent over HTTPS in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // Adjust based on your environment 
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.status(200).send("Logged in");
};


const logoutUser = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // Adjust based on your environment
  });
  res.status(200).json({ message: "Logged out" });
};

export { getToken, logoutUser };
