const express = require('express')
const router = express.Router()

const PedidosController = require('../controllers/pedidosController')

router.get('/', PedidosController.getPedidos)

router.post('/', PedidosController.postPedidos)

router.get('/:id_pedido', PedidosController.getPedidoId)

router.delete('/', PedidosController.deletePedido)

module.exports = router