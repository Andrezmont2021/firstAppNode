import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const processValidators = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        next();
    } else {
        res.status(400).send(errors.array());
    }
};
