const express = require('express');
const router = express.Router();
const contactsController = require('../../controllers/contactsController');
const {isEmptyBody} = require('../../middlewares/index');
const {validateBody} = require("../../decorators");
const {isValidId} = require("../../middlewares");
const {updateStatusContactSchema} = require("../../models/Contact");

const updateStatusContact = validateBody(updateStatusContactSchema);

router.get('/', contactsController.getAll )

router.get('/:contactId', isValidId, contactsController.getById )

router.post('/', isEmptyBody, contactsController.addContact )

router.delete('/:contactId', isValidId, contactsController.deleteContact )

router.put('/:contactId', isValidId, isEmptyBody, contactsController.updateContact )

router.patch('/:contactId/favorite', isValidId, isEmptyBody, updateStatusContact, contactsController.updateContact )

module.exports = router
