import db from "../models/index.js";

// Create a new customer - for admin use
export const createCustomer = async (req, res) => {
    const { name, email, password, phone, role, address, imageUrl, isActive } = req.body;
    
    try {
        // Ensure only admins can assign roles other than 'customer'
        if (role && role !== 'customer' && req.userRole !== 'admin') {
            return res.status(403).json({ message: "Insufficient permissions to assign this role" });
        }

        const existingCustomer = await db.User.findOne({ where: { email } });
        if (existingCustomer) {
            return res.status(400).json({ message: "Customer with this email already exists" });
        }

        // Create customer with all provided fields
        const newCustomer = await db.User.create({ 
            name, 
            email, 
            password, // Will be hashed by the model hook
            phone, 
            role: role || 'customer',
            isActive: isActive !== undefined ? isActive : true
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

        const customers = await db.User.findAll({
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
        console.log('Fetching customer with ID:', id);
        
        // Validate ID format
        if (!id || id === '0' || id === 'undefined' || id === 'null') {
            console.log('Invalid customer ID provided:', id);
            return res.status(400).json({ message: "Invalid customer ID" });
        }
        
        const customer = await db.User.findByPk(id, {
            attributes: { exclude: ['password'] } // Never return password
        });
        
        if (!customer) {
            console.log('Customer not found with ID:', id);
            return res.status(404).json({ message: "Customer not found" });
        }

        console.log('Found customer:', customer.name, 'Role:', customer.role);

        // Non-admins can only view customer accounts or their own account
        if (req.user && req.user.role !== 'admin' && customer.role !== 'customer' && customer.id !== req.user.id) {
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
        const customer = await db.User.findByPk(id);
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
            const existingCustomer = await db.User.findOne({ where: { email } });
            if (existingCustomer) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }

        // Prepare update object with allowed fields
        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (phone) updates.phone = phone;
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
        
        const customer = await db.User.findByPk(id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        
        // Safety check - prevent deleting the last admin
        if (customer.role === 'admin') {
            const adminCount = await db.User.count({ where: { role: 'admin' } });
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
        
        const totalCustomers = await db.User.count();
        const newCustomersThisMonth = await db.User.count({
            where: {
                createdAt: {
                    [db.Sequelize.Op.gte]: new Date(new Date().setDate(1)) // First day of current month
                }
            }
        });
        
        const customersByRole = await db.User.findAll({
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

// Get current user's profile
export const getCurrentProfile = async (req, res) => {
    try {
        console.log('=== GET CURRENT PROFILE ===');
        console.log('req.userId:', req.userId);
        console.log('req.user:', req.user);
        
        const userId = req.userId || req.user?.id;
        
        if (!userId) {
            console.log('ERROR: No userId found');
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        console.log('Fetching user with ID:', userId);
        const user = await db.User.findByPk(userId, {
            attributes: { exclude: ['password'] },
            include: [{
                model: db.CustomerProfile,
                as: 'customerProfile',
                required: false
            }]
        });
        
        if (!user) {
            console.log('ERROR: User not found for ID:', userId);
            return res.status(404).json({ message: "User not found" });
        }
        
        // Flatten the response to include customerProfile fields at root level
        const userData = user.toJSON();
        if (userData.customerProfile) {
            userData.driverLicense = userData.customerProfile.driverLicense;
            delete userData.customerProfile;
        }
        
        console.log('User found:', user.name, user.email);
        console.log('User data:', JSON.stringify(userData, null, 2));
        return res.status(200).json(userData);
    } catch (error) {
        console.error("Error fetching current profile:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Update current user's profile
export const updateCurrentProfile = async (req, res) => {
    try {
        console.log('=== UPDATE CURRENT PROFILE ===');
        console.log('req.userId:', req.userId);
        console.log('req.user:', req.user);
        console.log('req.body:', req.body);
        
        const userId = req.userId || req.user?.id;
        
        if (!userId) {
            console.log('ERROR: No userId found');
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        const { name, email, phone, address, dateOfBirth } = req.body;
        console.log('Update data:', { name, email, phone, address, dateOfBirth });
        
        const user = await db.User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Check if email is being changed and if it's already in use
        if (email && email !== user.email) {
            const existingUser = await db.User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }
        
        // Update allowed fields
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (email !== undefined) updates.email = email;
        if (phone !== undefined) updates.phone = phone;
        if (address !== undefined) updates.address = address;
        if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
        
        await user.update(updates);
        
        // Don't return the password
        const userData = user.toJSON();
        delete userData.password;
        
        return res.status(200).json(userData);
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Upload avatar for current user
export const uploadAvatar = async (req, res) => {
    try {
        console.log('=== UPLOAD AVATAR ===');
        const userId = req.userId || req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        
        console.log('File uploaded:', req.file.filename);
        const user = await db.User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Store the file path or URL
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        await user.update({ avatar: avatarUrl });
        
        console.log('Avatar updated to:', avatarUrl);
        return res.status(200).json({ avatar: avatarUrl });
    } catch (error) {
        console.error("Error uploading avatar:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Upload driver's license for current user
export const uploadDriverLicense = async (req, res) => {
    try {
        console.log('=== UPLOAD DRIVER LICENSE ===');
        const userId = req.userId || req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        
        console.log('File uploaded:', req.file.filename);
        
        // Find or create customer profile
        let customerProfile = await db.CustomerProfile.findOne({ where: { userId } });
        
        if (!customerProfile) {
            console.log('Creating new customer profile');
            customerProfile = await db.CustomerProfile.create({ userId });
        }
        
        // Store the file path or URL
        const licenseUrl = `/uploads/licenses/${req.file.filename}`;
        await customerProfile.update({ driverLicense: licenseUrl });
        
        console.log('Driver license updated to:', licenseUrl);
        return res.status(200).json({ driverLicense: licenseUrl });
    } catch (error) {
        console.error("Error uploading driver license:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};