const router = require('express').Router()
const controller = require('../controllers/productController.js')
const upload = require('../middleware/upload.js')


router.post('/', upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'documents', maxCount: 10 }
  ]), controller.createProduct)

router.get('/', controller.getAllProducts)

router.get('/:id', controller.getProduct)

router.put('/:id' ,upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'documents', maxCount: 10 }
  ]),controller.updateProduct)

router.delete('/:id', controller.deleteProduct)


module.exports = router