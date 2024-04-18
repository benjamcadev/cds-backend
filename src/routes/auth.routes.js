const { Router } = require('express')
const {register , login, logout } = require('../controllers/auth.controller')
const router = Router()

router.post('/auth/register', register)

router.post('/auth/login', login)

router.post('/auth/logout', logout)


module.exports = router