const jwt = require('jsonwebtoken')


const authRequired = (req, res, next) => {
const { token } = req.cookies

if(!token){
    return res.status(401).json({
        message: 'No existe token, autorizacion denegada'
    })
}

jwt.verify(token , process.env.PASS_TOKEN, (err, user) => {
    if(err){
       return res.status(403).json({message: 'Token Invalido'})
    }

    req.user = user
})

 next()
}

module.exports = { authRequired }