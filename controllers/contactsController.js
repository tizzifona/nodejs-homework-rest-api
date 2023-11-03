const {Contact} = require('../models/Contact');
const {HttpError} = require('../helpers');
const {ctrlWrapper} = require('../decorators/ctrlWraper');

const getAll = async (req, res) => {
    const {_id:owner} = req.user;
    const {page = 1, limit = 20} = req.query;
    const skip = (page -1)*limit;
    const result = await Contact.find({owner}, '-createdAt -updatedAt', {skip, limit}).populate('owner', 'username email');
    res.json(result);
}

const getById = async (req, res) => {
        const {_id:owner} = req.user;
        const {contactId} = req.params;
        const result = await Contact.findOne({_id: contactId, owner});
        if (!result) {
            throw HttpError (404, `Contact with ${contactId} not found`);
        }
        res.json(result);
}

const addContact = async (req, res) => {
    const {_id:owner} = req.user;
    const result = await Contact.create({...req.body, owner});
    res.status(201).json(result);
}

const deleteContact = async (req, res) => {
        const {contactId} = req.params;
        const {_id:owner} = req.user;
        const result = await Contact.findOneAndDelete({_id:contactId, owner});
        if (!result) {
            throw HttpError (404, `Contact with ${contactId} not found`);
        }
        res.json({"message": "contact deleted"});
}

const updateContact = async (req, res) => {
        const {contactId} = req.params;
        const {_id:owner} = req.user;
        const result = await Contact.findOneAndUpdate({_id:contactId, owner}, req.body)
        if (!result) {
            throw HttpError (404, `Contact with ${contactId} not found`);
        }
        res.json(result);
}

const updateStatusContact = async (req, res) => {
        const {contactId} = req.params;
        const { _id: owner } = req.user;
        const result = await Contact.findOneAndUpdate({ _id: contactId, owner }, req.body);
        if (!result) {
        throw HttpError(404, `Contact with ${contactId} not found`);
        }
        res.json(result);
}

module.exports = {
    getAll: ctrlWrapper(getAll),
    getById: ctrlWrapper(getById),
    addContact: ctrlWrapper(addContact),
    deleteContact: ctrlWrapper(deleteContact),
    updateContact: ctrlWrapper(updateContact),
    updateStatusContact: ctrlWrapper(updateStatusContact)
}