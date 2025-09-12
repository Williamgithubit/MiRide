import db from "../models/index.js";

// Create a new customer - for admin use
export const createCustomer = async (req, res) => {
    const { name, email, password, phone, role, address, imageUrl, isActive } = req.body;
    
    try {
        // Ensure only admins can assign roles other than 'customer'
        if (role && role !== 'customer' && req.userRole !== 'admin') {
            return res.status(403).json({ message: "Insufficient permissions to assign this role" });
        }

        const existingCustomer = await db.Customer.findOne({ where: { email } });
        if (existingCustomer) {
            return res.status(400).json({ message: "Customer with this email already exists" });
        }

        // Create customer with all provided fields
        const newCustomer = await db.Customer.create({ 
            name, 
            email, 
            password, // Will be hashed by the model hook
            phone, 
            role: role || 'customer',
            isActive: isActive !== undefined ? isActive : true,
            imageUrl,
            address
        });

        // Don't return the password in the response
        const customerData = newCustomer.toJSON();
        delete customerData.password;

        return res.status(201).json(customerData);
    } catch (error) {
        console.error("Error creating customer:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get all customers - with role-based filtering
export const getCustomers = async (req, res) => {
    try {
        // Optional query parameters
        const { role, isActive, search } = req.query;
        
        // Build filter conditions
        const whereClause = {};
        
        if (role) {
            whereClause.role = role;
        }
        
        if (isActive !== undefined) {
            whereClause.isActive = isActive === 'true';
        }
        
        if (search) {
            whereClause[db.Sequelize.Op.or] = [
                { name: { [db.Sequelize.Op.like]: `%${search}%` } },
                { email: { [db.Sequelize.Op.like]: `%${search}%` } }
            ];
        }
        
        // Non-admins can only see customer accounts
        if (req.userRole !== 'admin') {
            whereClause.role = 'customer';
        }

        const customers = await db.Customer.findAll({
            where: whereClause,
            attributes: { exclude: ['password'] }, // Never return passwords
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json(customers);
    } catch (error) {
        console.error("Error fetching customers:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get a single customer by ID
export const getCustomer = async (req, res) => {
    const { id } = req.params;

    try {
        const customer = await db.Customer.findByPk(id, {
            attributes: { exclude: ['password'] }, // Never return password
            include: [{
                model: db.Rental,
                as: 'rentals'
            }]
        });
        
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Non-admins can only view customer accounts or their own account
        if (req.userRole !== 'admin' && customer.role !== 'customer' && customer.id !== req.userId) {
            return res.status(403).json({ message: "Insufficient permissions to view this user" });
        }

        return res.status(200).json(customer);
    } catch (error) {
        console.error("Error fetching customer:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Update a customer
export const updateCustomer = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, role, address, imageUrl, isActive, password } = req.body;

    try {
        const customer = await db.Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Security checks
        const isSelfUpdate = req.userId === parseInt(id);
        const isAdminUpdate = req.userRole === 'admin';
        
        // Only admins can update role and active status
        // Users can update their own basic info
        if (!isAdminUpdate && !isSelfUpdate) {
            return res.status(403).json({ message: "You don't have permission to update this user" });
        }

        // Check if email is being changed and if it's already in use
        if (email && email !== customer.email) {
            const existingCustomer = await db.Customer.findOne({ where: { email } });
            if (existingCustomer) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }

        // Prepare update object with allowed fields
        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (phone) updates.phone = phone;
        if (address) updates.address = address;
        if (imageUrl) updates.imageUrl = imageUrl;
        if (password) updates.password = password; // Will be hashed by the model hook
        
        // Only admins can update these fields
        if (isAdminUpdate) {
            if (role !== undefined) updates.role = role;
            if (isActive !== undefined) updates.isActive = isActive;
        }

        await customer.update(updates);
        
        // Don't return the password
        const customerData = customer.toJSON();
        delete customerData.password;
        
        return res.status(200).json(customerData);
    } catch (error) {
        console.error("Error updating customer:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Delete a customer
export const deleteCustomer = async (req, res) => {
    const { id } = req.params;

    try {
        // Only admins can delete users
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: "Insufficient permissions to delete users" });
        }
        
        const customer = await db.Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        
        // Safety check - prevent deleting the last admin
        if (customer.role === 'admin') {
            const adminCount = await db.Customer.count({ where: { role: 'admin' } });
            if (adminCount <= 1) {
                return res.status(400).json({ message: "Cannot delete the only admin user" });
            }
        }

        // Soft delete by setting isActive to false
        await customer.update({ isActive: false });
        // Or hard delete if preferred
        // await customer.destroy();
        
        return res.status(200).json({ message: "Customer deactivated successfully" });
    } catch (error) {
        console.error("Error deleting customer:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get customer statistics (for admin dashboard)
export const getCustomerStats = async (req, res) => {
    try {
        // Only admins can access statistics
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }
        
        const totalCustomers = await db.Customer.count();
        const newCustomersThisMonth = await db.Customer.count({
            where: {
                createdAt: {
                    [db.Sequelize.Op.gte]: new Date(new Date().setDate(1)) // First day of current month
                }
            }
        });
        
        const customersByRole = await db.Customer.findAll({
            attributes: [
                'role',
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
            ],
            group: ['role']
        });
        
        return res.status(200).json({
            totalCustomers,
            newCustomersThisMonth,
            customersByRole
        });
    } catch (error) {
        console.error("Error fetching customer statistics:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};