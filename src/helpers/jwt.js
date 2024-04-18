const jwt = require('jsonwebtoken')


const createAccessToken = async (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            process.env.PASS_TOKEN,
            {
                expiresIn: "1d"
            },
            (err, token) => {
                if(err) reject(err)
                resolve(token)


            })
    })

}


module.exports = { createAccessToken }

