import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Modify request interface to include new session property
declare global{
    namespace Express{
        interface Request{
            session:{
                userId: string,
                email: string
            }
        }
    }
}

export const verifyAuthentication = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const token = req.headers['authorization'];
        if (token) {
            //Token exist, verify with secret and next
            const { userId, email } = jwt.verify(
                token,
                process.env.JWT_SECRET!
            ) as any;
            req.session = {
                userId,
                email
            }
            next();
        } else {
            // Token undefined
            throw new Error('Missing Authorization Header');
        }
    } catch (e) {
        let message = 'Unknown Eror';
        if (e instanceof Error) {
            message = e.message;
        }
        res.status(401).send(message);
    }
};
