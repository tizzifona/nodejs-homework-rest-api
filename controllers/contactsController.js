const {Contact} = require('../models/Contact');
const {HttpError} = require('../helpers');
const {ctrlWrapper} = require('../decorators/ctrlWraper');

const getAll = async (req, res) => {
    const result = await Contact.find();
    res.json(result);
}

const getById = async (req, res) => {
        const {contactId} = req.params;
        const result = await Contact.findOne({_id: contactId});
        if (!result) {
            throw HttpError (404, `Contact with ${contactId} not found`);
        }
        res.json(result);
}

const addContact = async (req, res) => {
    const result = await Contact.create(req.body);
    res.status(201).json(result);
}

const deleteContact = async (req, res) => {
        const {contactId} = req.params;
        const result = await Contact.findByIdAndDelete(contactId);
        if (!result) {
            throw HttpError (404, `Contact with ${contactId} not found`);
        }
        res.json({"message": "contact deleted"});
}

const updateContact = async (req, res) => {
        const {contactId} = req.params;
        const result = await Contact.findByIdAndUpdate(contactId, req.body)
        if (!result) {
            throw HttpError (404, `Contact with ${contactId} not found`);
        }
        res.json(result);
}

module.exports = {
    getAll: ctrlWrapper(getAll),
    getById: ctrlWrapper(getById),
    addContact: ctrlWrapper(addContact),
    deleteContact: ctrlWrapper(deleteContact),
    updateContact: ctrlWrapper(updateContact)
}