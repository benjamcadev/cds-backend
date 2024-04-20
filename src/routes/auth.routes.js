const { Router } = require('express')
const { register , login, logout } = require('../controllers/auth.controller')
const { validateSchema } = require('../middlewares/validateSchemas')
const { registerSchema, loginSchema } = require('../schemas/auth.schema')
const router = Router()

router.post('/auth/register', validateSchema(registerSchema), register)

router.post('/auth/login',validateSchema(loginSchema), login)

router.post('/auth/logout', logout)


module.exports = router