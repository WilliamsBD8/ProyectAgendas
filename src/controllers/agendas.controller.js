const prisma = require("../config/prisma/prisma");
const { successResponse } = require("../config/interfaces/success.interface");
const { validateFields } = require("../config/utils/rulesValidations");

exports.createAgenda = async (req, res, next) => {
    try {
        const validations = [
            { field: "activity", validations: [
                { type: "required", message: "La actividad es requerida" },
                { type: "min", value: 3, message: "La actividad debe tener al menos 3 caracteres" },
                { type: "max", value: 255, message: "La actividad debe tener menos de 255 caracteres" },
            ]},
            { field: "startTime", validations: [
                { type: "required", message: "La hora de inicio es requerida" },
                { type: "datetime", message: "La hora de inicio debe ser una fecha y hora válida" },
                { type: "max", value: req.body.endTime, message: "La hora de inicio debe ser menor a la hora de fin" },
            ]},
            { field: "endTime", validations: [
                { type: "required", message: "La hora de fin es requerida" },
                { type: "datetime", message: "La hora de fin debe ser una fecha y hora válida" },
                { type: "min", value: req.body.startTime, message: "La hora de fin debe ser mayor a la hora de inicio" },
            ]},
            { field: "eventId", validations: [
                { type: "required", message: "El evento es requerido" },
                { type: "number", message: "El evento debe ser un número" },
            ]},
        ];

        validateFields(req.body, validations, res);

        const { activity, startTime, endTime, eventId } = req.body;

        const newAgenda = await prisma.agendas.create({
            data: { activity, startTime, endTime, eventId }
        });

        return res.json(successResponse("Agenda creada", newAgenda, 201));
    }
    catch (error) {
        next(error);
    }
}

exports.updateAgenda = async (req, res, next) => {
    try {
        const validations = [
            { field: "activity", validations: [
                { type: "required", message: "La actividad es requerida" },
                { type: "min", value: 3, message: "La actividad debe tener al menos 3 caracteres" },
                { type: "max", value: 255, message: "La actividad debe tener menos de 255 caracteres" },
            ]},
            { field: "startTime", validations: [
                { type: "required", message: "La hora de inicio es requerida" },
                { type: "datetime", message: "La hora de inicio debe ser una fecha y hora válida" },
                { type: "max", value: req.body.endTime, message: "La hora de inicio debe ser menor a la hora de fin" },
            ]},
            { field: "endTime", validations: [
                { type: "required", message: "La hora de fin es requerida" },
                { type: "datetime", message: "La hora de fin debe ser una fecha y hora válida" },
                { type: "min", value: req.body.startTime, message: "La hora de fin debe ser mayor a la hora de inicio" },
            ]},
            { field: "eventId", validations: [
                { type: "required", message: "El evento es requerido" },
                { type: "number", message: "El evento debe ser un número" },
            ]},
            { field: "status", validations: [
                { type: "required", message: "El estado es requerido" },
                { type: "in", value: ["PENDING", "IN_PROGRESS", "CONFIRMED", "CANCELLED", "COMPLETED", "ARCHIVED"], message: "El estado debe ser PENDING, IN_PROGRESS, CONFIRMED, CANCELLED, COMPLETED o ARCHIVED" },
            ]},
        ];

        validateFields(req.body, validations, res);

        const { id } = req.params;
        const { activity, startTime, endTime, eventId, status } = req.body;
        const updatedAgenda = await prisma.agendas.update({
            where: { id: parseInt(id), deletedAt: null },
            data: { activity, startTime, endTime, eventId, status }
        });

        return res.json(successResponse("Agenda actualizada", updatedAgenda, 200));
    }    catch (error) {
        next(error);
    }
}

exports.deleteAgenda = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedAgenda = await prisma.agendas.update({
            where: { id: parseInt(id), deletedAt: null },
            data: { deletedAt: new Date() }
        });
        return res.json(successResponse("Agenda eliminada", deletedAgenda, 200));
    }
    catch (error) {
        next(error);
    }
}