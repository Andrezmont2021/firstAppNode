import { Router } from 'express';
import * as userController from '../../controllers/v1/user-controller';
import { verifyAuthentication } from '../../middlewares/auth-middleware';

const router = Router();

router.get('', verifyAuthentication, userController.getUsers);
router.post('/create', verifyAuthentication, userController.createUser);
router.get('/:id', verifyAuthentication, userController.getSpecificUser);
router.delete(
    '/:id/remove-user',
    verifyAuthentication,
    userController.deleteUser
);
router.post('/login', userController.login);

export default router;
