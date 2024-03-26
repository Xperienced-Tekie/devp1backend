import jwt from 'jsonwebtoken';

export const authenticateUser = async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication token is missing.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Assuming the decoded token contains the user's email address
        const userEmail = decoded.email; 

        if (!userEmail) {
            return res.status(401).json({ error: 'Email address is missing in the token.' });
        }

        // Add the user's email to the request object
        req.user = { ...decoded, email: userEmail };

        // Optionally, you can send a response with the email address
        // return res.status(200).json({ email: userEmail });

    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.status(401).json({ error: error.message });
    }
};
