const express = require('express')
const router = express.Router()
const multer = require('multer')
const login = require('../middleware/login')

const ProdutosController = require('../controllers/produtosController')

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

router.get('/', ProdutosController.getProdutos)

router.post('/', login.obrigatorio, upload.single('produto_imagem'), ProdutosController.postProdutos)

router.get('/:id_produto', ProdutosController.getProdutoId)

router.patch('/', login.obrigatorio, ProdutosController.patchProduto)

router.delete('/', login.obrigatorio, ProdutosController.deleteProduto)

module.exports = router