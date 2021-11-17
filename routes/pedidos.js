const express = require('express')
const router = express.Router()
const mysql = require('../mysql').pool

//Busca todos os pedidos
router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        
        if(error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM pedidos INNER JOIN produtos ON produtos.id_produto = pedidos.id_produto',
            (error, result, field) => {
                if(error) { return res.status(500).send({ error: error }) }

                //Resposta com doc
                const response = {
                    pedidos: result.map(ped => {
                        return {
                            id_pedido: ped.id_pedido,
                            quantidade: ped.quantidade,
                            produto: {
                                id_produto: ped.id_produto,
                                nome: ped.nome,
                                preco: ped.preco
                            },                            
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna detalhes do Pedido.',
                                url: 'http://localhost:3000/pedidos/' + ped.id_pedido
                            }
                        }
                    })
                }

                return res.status(200).send(response)
            }
        )
    })
})

//Cadastra um pedido
router.post('/', (req, res, next) => {

    mysql.getConnection((error, conn) => {
        
        if(error) { return res.status(500).send({ error: error }) }

        //Valida se existe um Produto antes de fazer o pedido deste Produto.
        conn.query(
            'SELECT * FROM produtos WHERE id_produto = ?',
            [req.body.id_produto],
            (error, result, field) => {

                if(error) { return res.status(500).send({ error: error }) }

                if(result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Produto não Encontrado.'
                    })
                }

                conn.query(
                    'INSERT INTO pedidos (id_produto, quantidade) VALUES (?, ?)',
                    [req.body.id_produto, req.body.quantidade],
                    
                    (error, result, field) => {
                        
                        conn.release()
        
                        if(error) { return res.status(500).send({ error: error }) }
        
                        //Resposta com doc
                        const response = {
                            mensagem: 'Pedido Cadastrado.',
                            pedidoCriado: {
                                id_pedido: result.id_pedido,
                                id_produto: req.body.id_produto,
                                quantidade: req.body.quantidade,
                                request: {
                                    tipo: 'GET',
                                    descricao: 'Retorna todos os Pedidos.',
                                    url: 'http://localhost:3000/pedidos' 
                                }
                            }
                        }
        
                        return res.status(201).send(response)
                    }
                )
            }
        )
    })
})

//Busca pedido por id
router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        
        if(error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM pedidos WHERE id_pedido = ?',
            [req.params.id_pedido],

            (error, result, field) => {
                if(error) { return res.status(500).send({ error: error }) }

                if(result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Pedido não Encontrado.'
                    })
                }
                
                //Resposta com doc
                const response = {
                    pedido: {
                        id_pedido: result[0].id_pedido,
                        id_produto: result[0].id_produto,
                        quantidade: result[0].quantidade,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todos os Pedidos.',
                            url: 'http://localhost:3000/pedidos' 
                        }
                    }
                }

                return res.status(200).send(response)
            }
        )
    })
})

//Deleta um pedido
router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        
        if(error) { return res.status(500).send({ error: error }) }
        conn.query(
            'DELETE FROM pedidos WHERE id_pedido = ?',
            [req.body.id_pedido],
            
            (error, result, field) => {
                
                conn.release()

                if(error) { return res.status(500).send({ error: error }) }

                if(result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Pedido não Encontrado.'
                    })
                }

                //Resposta com doc
                const response = {
                    mensagem: 'Pedido Deletado.',

                    request: {
                        tipo: 'POST',
                        descricao: 'Cadastro de Pedido.',
                        url: 'http://localhost:3000/pedidos',
                        body: {
                            id_produto: 'Integer',
                            quantidade: 'Integer'
                        }
                    }
                }

                return res.status(202).send(response)
            }
        )
    })
})

module.exports = router