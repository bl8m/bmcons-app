import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createUserSchema, updateUserSchema } from '../validators/userValidators.js';

const router = Router();

// Solo gli administrator possono gestire gli utenti.
router.use(authenticate, requireRole('administrator'));

router.get('/', userController.listUsers);
router.get('/:id', userController.getUser);
router.post('/', validate(createUserSchema), userController.createUser);
router.patch('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
