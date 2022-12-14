import { Router } from 'express';
import * as productController from '../../controllers/v1/product-controller';
import { verifyAuthentication } from '../../middlewares/auth-middleware';
import { processValidators } from '../../middlewares/validator-handler-middleware';
import {
    validateCreateProductData,
    validateObjectId,
    validateUpdateProductDataAndNotify,
} from '../../middlewares/validators/v1/product-validator';

const router = Router();

router.get('', verifyAuthentication, productController.getProducts);
router.get(
    '/byUser',
    verifyAuthentication,
    productController.getProductsByUser
);
router.get(
    '/:id',
    verifyAuthentication,
    validateObjectId,
    processValidators,
    productController.getProductById
);
router.post(
    '/create',
    verifyAuthentication,
    validateCreateProductData,
    processValidators,
    productController.createProduct
);
router.put('/:id', verifyAuthentication, productController.updateProduct);
router.patch(
    '/:id',
    verifyAuthentication,
    productController.partialUpdateOfProduct
);
router.post(
    '/:id/notify-client',
    verifyAuthentication,
    validateUpdateProductDataAndNotify,
    processValidators,
    productController.partialUpdateOfProductAndNotify
);
router.delete(
    '/:id/remove-product',
    verifyAuthentication,
    validateObjectId,
    processValidators,
    productController.deleteProduct
);

export default router;
