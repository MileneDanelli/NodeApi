const express = require('express')
const router = express.Router()
const mysql = require('../mysql').pool
const multer = require('multer')
const login = require('../middleware/login')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function(req, file, cb) {
        let data = new Date().toISOString().replace(/:/g, '-') + '-';
        cb(null, data + file.originalname );
    },
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
})

//Busca todos os produtos
router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        
        if(error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM produtos',
            (error, result, field) => {
                if(error) { return res.status(500).send({ error: error }) }

                //Resposta com doc
                const response = {
                    quantidade: result.length,
                    produtos: result.map(prod => {
                        return {
                            id_produto: prod.id_produto,
                            nome: prod.nome,
                            preco: prod.preco,
                            produto_imagem: prod.produto_imagem,
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna detalhes do Produto.',
                                url: 'http://localhost:3000/produtos/' + prod.id_produto
                            }
                        }
                    })
                }

                return res.status(200).send(response)
            }
        )
    })
})

//Cadastra um produto
router.post('/', login.obrigatorio, upload.single('produto_imagem'), (req, res, next) => {
    mysql.getConnection((error, conn) => {
        
        if(error) { return res.status(500).send({ error: error }) }
        conn.query(
            'INSERT INTO produtos (nome, preco, produto_imagem) VALUES (?, ?, ?)',
            [
                req.body.nome, 
                req.body.preco,
                req.file.path
            ],
            
            (error, result, field) => {
                conn.release()
                if(error) { return res.status(500).send({ error: error }) }

                //Resposta com doc
                const response = {
                    mensagem: 'Produto Cadastrado.',
                    produtoCriado: {
                        id_produto: result.id_produto,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        produto_imagem: req.file.path,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todos os Produtos.',
                            url: 'http://localhost:3000/produtos' 
                        }
                    }
                }

                return res.status(201).send(response)
            }
        )
    })
})

//Busca produto por id
router.get('/:id_produto', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        
        if(error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM produtos WHERE id_produto = ?',
            [req.params.id_produto],

            (error, result, field) => {
                if(error) { return res.status(500).send({ error: error }) }

                if(result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Produto não Encontrado.'
                    })
                }
                
                //Resposta com doc
                const response = {
                    produto: {
                        id_produto: result[0].id_produto,
                        nome: result[0].nome,
                        preco: result[0].preco,
                        produto_imagem: result[0].produto_imagem,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todos os Produtos.',
                            url: 'http://localhost:3000/produtos' 
                        }
                    }
                }

                return res.status(200).send(response)
            }
        )
    })
})

//Edita um produto
router.patch('/', login.obrigatorio, (req, res, next) => {
    mysql.getConnection((error, conn) => {
        
        if(error) { return res.status(500).send({ error: error }) }
        conn.query(
            `UPDATE produtos
                SET nome = ?, 
                    preco = ?
            WHERE id_produto = ?`,
            [
                req.body.nome, 
                req.body.preco, 
                req.body.id_produto
            ],
            
            (error, result, field) => {
                
                conn.release()

                if(error) { return res.status(500).send({ error: error }) }

                //Resposta com doc
                const response = {
                    mensagem: 'Produto Editado.',
                    produtoEditado: {
                        id_produto: req.body.id_produto,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna detalhes do Produto.',
                            url: 'http://localhost:3000/produtos/' + req.body.id_produto
                        }
                    }
                }

                return res.status(202).send(response)
            }
        )
    })
})

//Deleta um produto
router.delete('/', login.obrigatorio, (req, res, next) => {
    mysql.getConnection((error, conn) => {
        
        if(error) { return res.status(500).send({ error: error }) }
        conn.query(
            'DELETE FROM produtos WHERE id_produto = ?',
            [req.body.id_produto],
            
            (error, result, field) => {
                
                conn.release()

                if(error) { return res.status(500).send({ error: error }) }

                //Resposta com doc
                const response = {
                    mensagem: 'Produto Deletado.',
                    request: {
                        tipo: 'POST',
                        descricao: 'Cadastro de Produto.',
                        url: 'http://localhost:3000/produtos',
                        body: {
                            nome: 'String',
                            preco: 'Number'
                        }
                    }
                }

                return res.status(202).send(response)
            }
        )
    })
})

module.exports = router