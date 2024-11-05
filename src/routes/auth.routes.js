const { Router } = require('express')
const { register , login, logout, verifyToken, forget, changePass } = require('../controllers/auth.controller')
const { validateSchema } = require('../middlewares/validateSchemas')
const { registerSchema, loginSchema } = require('../schemas/auth.schema')
const router = Router()

router.post('/api/v1/auth/register', validateSchema(registerSchema), register)

router.post('/api/v1/auth/login',validateSchema(loginSchema), login)

router.post('/api/v1/auth/logout', logout)

router.post('/api/v1/auth/forget', forget)

router.post('/api/v1/auth/changepass', changePass)

router.get('/api/v1/auth/verify', verifyToken)


module.exports = router