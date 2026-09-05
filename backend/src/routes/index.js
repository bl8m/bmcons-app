import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import documentRoutes from './documentRoutes.js';
import customerRoutes from './customerRoutes.js';
import addressRoutes from './addressRoutes.js';
import phoneRoutes from './phoneRoutes.js';
import emailAddressRoutes from './emailAddressRoutes.js';
import bankRoutes from './bankRoutes.js';
import bankAccountRoutes from './bankAccountRoutes.js';
import loanRoutes from './loanRoutes.js';
import loanInstallmentRoutes from './loanInstallmentRoutes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/documents', documentRoutes);
router.use('/customers', customerRoutes);
router.use('/addresses', addressRoutes);
router.use('/phones', phoneRoutes);
router.use('/email-addresses', emailAddressRoutes);
router.use('/banks', bankRoutes);
router.use('/bank-accounts', bankAccountRoutes);
router.use('/loans', loanRoutes);
router.use('/loan-installments', loanInstallmentRoutes);

export default router;
