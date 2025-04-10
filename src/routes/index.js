

const articulosRoutes = require('./articulos.routes');
const bodegasRoutes = require('./bodegas.routes');
const ticketEntradaRoutes = require('./ticketentrada.routes');
const usuariosRoutes = require('./usuarios.routes');
const ticketSalidaRoutes = require('./ticketsalida.routes');
const authRoutes = require('./auth.routes');
const categoriasRoutes = require('./categoria.routes');
const cotizacionRoutes = require('./cotizacion.routes')


module.exports = {
  articulosRoutes,
  bodegasRoutes,
  ticketEntradaRoutes,
  usuariosRoutes,
  ticketSalidaRoutes,
  authRoutes,
  categoriasRoutes,
  cotizacionRoutes
};