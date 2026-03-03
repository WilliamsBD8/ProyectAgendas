const prisma = require("../config/prisma/prisma");
const { successResponse } = require("../config/interfaces/success.interface");
const { validateFields } = require("../config/utils/rulesValidations");

exports.createEvent = async (req, res, next) => {
    try {
        const validations = [
            { field: "name", validations: [
                { type: "required", message: "El nombre del evento es requerido" },
            ]},
            { field: "type", validations: [
                { type: "required", message: "El tipo de evento es requerido" },
                { type: "in", value: ["PUBLIC", "PRIVATE"], message: "El tipo de evento debe ser PUBLIC o PRIVATE" },
            ]},
            { field: "description", validations: [
                { type: "required", message: "La descripción del evento es requerida" },
                { type: "min", value: 3, message: "La descripción del evento debe tener al menos 3 caracteres" },
                { type: "max", value: 255, message: "La descripción del evento debe tener menos de 255 caracteres" },
            ]},
            { field: "startTime", validations: [
                { type: "required", message: "La hora de inicio del evento es requerida" },
                { type: "datetime", message: "La hora de inicio del evento debe ser una fecha y hora válida" },
                { type: "max", value: req.body.endTime, message: "La hora de inicio del evento debe ser menor a la hora de fin del evento" },
            ]},
            { field: "endTime", validations: [
                { type: "required", message: "La hora de fin del evento es requerida" },
                { type: "datetime", message: "La hora de fin del evento debe ser una fecha y hora válida" },
                { type: "min", value: req.body.startTime, message: "La hora de fin del evento debe ser mayor a la hora de inicio del evento" },
            ]},
            { field: "siteId", validations: [
                { type: "required", message: "El sitio del evento es requerido" },
                { type: "number", message: "El sitio del evento debe ser un número" },
            ]},
        ];

        validateFields(req.body, validations, res);

        const { name, type, description, startTime, endTime, siteId } = req.body;
        const userId = parseInt(req.user.id);

        const newEvent = await prisma.events.create({
            data: { name, type, description, startTime, endTime, siteId, userId }
        });

        return res.json(successResponse("Evento creado", newEvent, 201));
    }
    catch (error) {
        next(error);
    }
}

exports.updateEvent = async (req, res, next) => {
    try {
        const validations = [
            { field: "name", validations: [
                { type: "required", message: "El nombre del evento es requerido" },
            ]},
            { field: "status", validations: [
                { type: "required", message: "El estado del evento es requerido" },
                { type: "in", value: ["PENDING", "IN_PROGRESS", "CONFIRMED", "CANCELLED", "COMPLETED", "ARCHIVED"], message: "El estado del evento debe ser PENDING, IN_PROGRESS, CONFIRMED, CANCELLED, COMPLETED o ARCHIVED" },
            ]},
            { field: "type", validations: [
                { type: "required", message: "El tipo de evento es requerido" },
                { type: "in", value: ["PUBLIC", "PRIVATE"], message: "El tipo de evento debe ser PUBLIC o PRIVATE" },
            ]},
            { field: "description", validations: [
                { type: "required", message: "La descripción del evento es requerida" },
                { type: "min", value: 3, message: "La descripción del evento debe tener al menos 3 caracteres" },
                { type: "max", value: 255, message: "La descripción del evento debe tener menos de 255 caracteres" },
            ]},
            { field: "startTime", validations: [
                { type: "required", message: "La hora de inicio del evento es requerida" },
                { type: "datetime", message: "La hora de inicio del evento debe ser una fecha y hora válida" },
                { type: "max", value: req.body.endTime, message: "La hora de inicio del evento debe ser menor a la hora de fin del evento" }
            ]},
            { field: "endTime", validations: [
                { type: "required", message: "La hora de fin del evento es requerida" },
                { type: "datetime", message: "La hora de fin del evento debe ser una fecha y hora válida" },
                { type: "min", value: req.body.startTime, message: "La hora de fin del evento debe ser mayor a la hora de inicio del evento" }
            ]},
            { field: "siteId", validations: [
                { type: "required", message: "El sitio del evento es requerido" },
                { type: "number", message: "El sitio del evento debe ser un número" },
            ]},
        ];

        validateFields(req.body, validations, res);

        const { id } = req.params;
        const { name, status, type, description, startTime, endTime, siteId } = req.body;
        const userId = parseInt(req.user.id);

        const updatedEvent = await prisma.events.update({
            where: { id: parseInt(id), deletedAt: null, userId },
            data: { name, status, type, description, startTime, endTime, siteId }
        });

        return res.json(successResponse("Evento actualizado", updatedEvent, 200));
    } catch (error) {
        next(error);
    }
}

exports.deleteEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = parseInt(req.user.id);
        const deletedEvent = await prisma.events.update({
            where: { id: parseInt(id), deletedAt: null, userId },
            data: { deletedAt: new Date() }
        });
        return res.json(successResponse("Evento eliminado", deletedEvent, 200));
    }
    catch (error) {
        next(error);
    }
}

exports.getEvents = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, all = false } = req.query;
        const userId = parseInt(req.user.id);
        const where = {
            deletedAt: null,
            site: {
                is: {
                    deletedAt: null,
                },
            },
        };

        if(req.user.role.id !== 1){
            where.userId = userId;
        }

        let query = {
            where,
            include: {
                site: {
                    select: {
                        name: true,
                    },
                },
                user: {
                    select: {
                        name: true,
                    },
                },
                agendas: {
                    where: { deletedAt: null },
                    select: {
                        activity: true,
                        startTime: true,
                        endTime: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                id: "desc",
            }
        };
        if (!all || all == "false") {
            query.skip = (parseInt(page) - 1) * parseInt(limit);
            query.take = parseInt(limit);
        }   
        const [events, total] = await Promise.all([
            prisma.events.findMany(query),
            prisma.events.count({ where })
        ]);
        return res.json(successResponse("Eventos obtenidos", {
            data: events,
            pagination: {
                page,
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
            }
        }, 200));
    }
    catch (error) {
        next(error);
    }
}