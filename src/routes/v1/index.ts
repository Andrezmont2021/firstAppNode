import { Application } from 'express';
import productRouter from './product-router';
import userRouter from './user-router';

/**
 * Function that contains the different end points to be accessed
 * @param {*} app: Express application
 */
export const routesV1 = (app: Application): void => {
    app.use('/api/v1/products', productRouter);
	app.use('/api/v1/users', userRouter);
};
// Export the apiV1
export default routesV1;
