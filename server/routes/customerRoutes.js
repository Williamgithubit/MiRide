import express from 'express';
import { createCustomer, getCustomers, getCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController.js';
import auth from '../middleware/auth.js';

const customerRouter = express.Router();

// Public routes - anyone can view customers
customerRouter.get('/', getCustomers);
customerRouter.get('/:id', getCustomer);

// Customer routes - only authenticated customers can update their own profile
customerRouter.post('/', auth(['customer']), createCustomer);
customerRouter.put('/:id', auth(['customer']), updateCustomer);

// Admin routes - only admin can manage customers
customerRouter.delete('/:id', auth(['admin']), deleteCustomer);

export default customerRouter;