const {z} = require('zod')

const registerSchema = z.object({
    usuario: z.string({
        required_error: 'campo usuario es requerido'
    }),
    correo: z.string({
        required_error: 'campo correo es requerido'
    }).email({
        message: 'correo invalido'
    }),
    pass: z.string({
        required_error: 'campo pass es requerida'
    }).min(6, {
        message: 'Contraseña debe tener minimo de 6 caracteres.'
    }),
    nombre: z.string({
        required_error: 'campo nombre es requerido'
    }),
    tipo_usuario: z.number({
        required_error: 'campo tipo_usuario es requerido'
    })

})

const loginSchema = z.object({
    correo: z.string({
        required_error: 'campo correo es requerido'
    }).email({
        message: 'Correo invalido'
    }),
    pass: z.string({
        required_error: 'campo pass es requerido'
    }).min(6, {
        message: 'Contraseña debe tener minimo 6 caracteres'
    })
})

module.exports = {registerSchema, loginSchema}