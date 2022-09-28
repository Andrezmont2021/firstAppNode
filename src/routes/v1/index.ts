import { Application } from 'express';
import * as userController from '../../controllers/v1/user-controller';
import * as productController from '../../controllers/v1/product-controller';

/**
 * Function that contains the different end points to be accessed
 * @param {*} app: Express application
 */
export const routesV1 = (app: Application): void => {
    app.get('/api/v1/users', userController.getUsers);
    app.post('/api/v1/users/create', userController.createUser);
    app.get('/api/v1/users/:id', userController.getSpecificUser);
    app.get('/api/v1/products', productController.getProducts);
	app.get('/api/v1/products/:id', productController.getProductById);
    app.post('/api/v1/products/create', productController.createProduct);
	/**
	app.put('/api/v1/products/:id', productController.updateProduct);
	app.patch('/api/v1/products/:id', productController.partialUpdateOfProduct);
	app.post(
		'/api/v1/products/:id/notify-client',
		productController.partialUpdateOfProductAndNotify
	);
	app.delete(
		'/api/v1/products/:id/remove-product',
		productController.deleteProduct
	);**/
};
// Export the apiV1
export default routesV1;
