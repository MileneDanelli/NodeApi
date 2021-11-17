const express = require('express')
const router = express.Router()
const mysql = require('../mysql').pool
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.post('/cadastro', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        
        if(error) { return res.status(500).send({ error: error }) }

        conn.query(
            'SELECT * FROM usuarios WHERE email = ?', 
            [req.body.email], 
            (error, result) => {
                if(error) { return res.status(500).send({ error: error }) }
                if(result.length > 0) {
                    res.status(409).send({mensagem: 'Este email já existe!'})
                } else {
                    bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                        if(errBcrypt) {
                            return res.status(500).send({ error: errBcrypt })
                        }
            
                        conn.query(
                            `INSERT INTO usuarios (email, senha) VALUES (?, ?)`,
                            [req.body.email, hash],
                            (error, result) => {
                                conn.release()
                                if(error) { return res.status(500).send({ error: error }) }
            
                                response = {
                                    mensagem: "Usuário criado.",
                                    usuarioCriado: {
                                        id_usuario: result.insertId,
                                        email:req.body.email
                                    }
                                }
            
                                return res.status(201).send(response)
                            }
                        )
                    })
                }
            }
        )
    })
})

router.post('/login', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        
        if(error) { return res.status(500).send({ error: error }) }

        conn.query(
            'SELECT * FROM usuarios WHERE email = ?', 
            [req.body.email], 
            (error, result) => {
                conn.release()
                if(error) { return res.status(500).send({ error: error }) }
                if(result.length < 1) {
                    return res.status(401).send({mensagem: "Falha na Autenticação!"})
                }
                bcrypt.compare(req.body.senha, result[0].senha, (err, results) => {
                    if (err) {
                        return res.status(401).send({mensagem: "Falha na Autenticação!"})
                    }
                    if(results) {
                        const token = jwt.sign({
                                id_usuario: result[0].id_usuario,
                                email: result[0].email
                            }, 
                            process.env.JWT_KEY, 
                            {
                                expiresIn: "1h"
                            }
                        )
                        return res.status(200).send({
                            mensagem: "Usuário Autenticado!",
                            token: token
                        })
                    }
                    return res.status(401).send({mensagem: "Falha na Autenticação!"})
                })
            }
        )
    })
})

module.exports = router