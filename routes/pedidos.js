const express = require('express')
const router = express.Router()

//Busca todos os pedidos
router.get('/', (req, res, next) => {
    res.status(200).send({
        mensagem: 'Todos os Pedidos.'
    })
})

//Cadastra um pedido
router.post('/', (req, res, next) => {

    const pedido = {
        id_produto: req.body.id_produto,
        quantidade: req.body.quantidade
    }

    res.status(201).send({
        mensagem: 'Pedido Cadastrado.',
        pedidoCriado: pedido
    })
})

//Busca pedido por id
router.get('/:id_pedido', (req, res, next) => {
    const id = req.params.id_pedido

    res.status(200).send({
        mensagem: 'Pedido.',
        id: id
    })
})

//Deleta um pedido
router.delete('/:id_pedido', (req, res, next) => {
    const id = req.params.id_pedido
    
    res.status(201).send({
        mensagem: 'Pedido Deletado.',
        id: id
    })
})

module.exports = router