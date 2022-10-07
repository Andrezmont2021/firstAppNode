import { Response } from 'express';

export interface CatchedErrorParameters {
    error: Error;
    res: Response;
    action: string;
    module: string;
    params: any;
}
