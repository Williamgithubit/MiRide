# 🚀 Quick Admin Setup - Production

## 1. Set Environment Variable on Render

```
ADMIN_SETUP_SECRET=your-super-secret-key-here
```

Generate a secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 2. Deploy to Render

```bash
git add .
git commit -m "Add admin setup endpoint"
git push origin main
```

---

## 3. Create Admin User

### Using cURL:

```bash
curl -X POST https://miride.onrender.com/api/admin-setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your-super-secret-key-here",
    "email": "admin@miride.com",
    "password": "Admin@123456",
    "name": "Admin User",
    "phone": "+231778711864"
  }'
```

### Using Postman:

**POST** `https://miride.onrender.com/api/admin-setup/create-admin`

**Body (JSON):**
```json
{
  "secret": "your-super-secret-key-here",
  "email": "admin@miride.com",
  "password": "Admin@123456",
  "name": "Admin User",
  "phone": "+231778711864"
}
```

---

## 4. Test Login

Go to: `https://miride.onrender.com/login`

- **Email:** admin@miride.com
- **Password:** Admin@123456

---

## 🔍 Debug Endpoint

If login fails, verify the password:

```bash
curl -X POST https://miride.onrender.com/api/admin-setup/verify-password \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your-super-secret-key-here",
    "email": "admin@miride.com",
    "password": "Admin@123456"
  }'
```

Should return `"passwordMatch": true`

---

## 📁 Files Created

- `controllers/adminSetupController.js` - Endpoint logic
- `routes/adminSetup.js` - Route definitions
- `server.js` - Updated with new route
- `ADMIN_SETUP_ENDPOINT_GUIDE.md` - Full documentation
- `test_admin_setup.js` - Local testing script

---

## ✅ Security Checklist

- [ ] Set strong `ADMIN_SETUP_SECRET` in Render
- [ ] Never commit the secret to Git
- [ ] Use HTTPS only (Render provides this)
- [ ] Change admin password after first login
- [ ] Monitor Render logs for unauthorized attempts

---

## 🎯 That's It!

The endpoint will:
1. ✅ Hash passwords correctly (no double-hashing)
2. ✅ Create or update admin users
3. ✅ Bypass Sequelize hooks that cause issues
4. ✅ Work with your existing login system
5. ✅ Be protected by secret key

**No more SQL scripts needed!**
