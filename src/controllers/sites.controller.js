const prisma = require("../config/prisma/prisma");
const { successResponse } = require("../config/interfaces/success.interface");
const { validateFields } = require("../config/utils/rulesValidations");

exports.createSite = async (req, res, next) => {
    try {

        const validations = [
            { field: "name", validations: [
                { type: "required", message: "El nombre del sitio es requerido" },
                { type: "min", value: 3, message: "El nombre del sitio debe tener al menos 3 caracteres" },
                { type: "max", value: 50, message: "El nombre del sitio debe tener menos de 50 caracteres" },
            ]},
            { field: "ubication", validations: [
                { type: "required", message: "La ubicación del sitio es requerida" },
                { type: "min", value: 3, message: "La ubicación del sitio debe tener al menos 3 caracteres" },
                { type: "max", value: 255, message: "La ubicación del sitio debe tener menos de 255 caracteres" },
            ]},
            { field: "direction", validations: [
                { type: "required", message: "La dirección del sitio es requerida" },
                { type: "min", value: 3, message: "La dirección del sitio debe tener al menos 3 caracteres" },
                { type: "max", value: 255, message: "La dirección del sitio debe tener menos de 255 caracteres" },
            ]},
            { field: "phone", validations: [
                { type: "required", message: "El teléfono del sitio es requerido" },
                { type: "string", message: "El teléfono del sitio debe ser una cadena de texto" },
                { type: "min", value: 10, message: "El teléfono del sitio debe tener al menos 10 caracteres" },
                { type: "max", value: 12, message: "El teléfono del sitio debe tener menos de 12 caracteres" },
            ]},
            { field: "email", validations: [
                { type: "required", message: "El email del sitio es requerido" },
                { type: "email", message: "El email del sitio no es válido" },
            ]},
            { field: "capacity", validations: [
                { type: "required", message: "La capacidad del sitio es requerida" },
                { type: "number", message: "La capacidad del sitio debe ser un número" },
                { type: "min", value: 1, message: "La capacidad del sitio debe ser al menos 1" },
            ]},
        ];
        validateFields(req.body, validations, res);

        const { name, description, ubication, direction, phone, email, capacity } = req.body;

        const userId = parseInt(req.user.id);
        
        const newSite = await prisma.sites.create({
            data: { name, description, ubication, direction, phone, email, capacity, userId }
        });
        return res.json(successResponse("Sitio creado", newSite, 201));
    }
    catch (error) {
        next(error);
    }
}

exports.updateSite = async (req, res, next) => {
    try {
        const validations = [
            { field: "name", validations: [
                { type: "required", message: "El nombre del sitio es requerido" },
                { type: "min", value: 3, message: "El nombre del sitio debe tener al menos 3 caracteres" },
                { type: "max", value: 50, message: "El nombre del sitio debe tener menos de 50 caracteres" },
            ]},
            { field: "ubication", validations: [
                { type: "required", message: "La ubicación del sitio es requerida" },
                { type: "min", value: 3, message: "La ubicación del sitio debe tener al menos 3 caracteres" },
                { type: "max", value: 255, message: "La ubicación del sitio debe tener menos de 255 caracteres" },
            ]},
            { field: "direction", validations: [
                { type: "required", message: "La dirección del sitio es requerida" },
                { type: "min", value: 3, message: "La dirección del sitio debe tener al menos 3 caracteres" },
                { type: "max", value: 255, message: "La dirección del sitio debe tener menos de 255 caracteres" },
            ]},
            { field: "phone", validations: [
                { type: "required", message: "El teléfono del sitio es requerido" },
                { type: "string", message: "El teléfono del sitio debe ser una cadena de texto" },
                { type: "min", value: 10, message: "El teléfono del sitio debe tener al menos 10 caracteres" },
                { type: "max", value: 12, message: "El teléfono del sitio debe tener menos de 12 caracteres" },
            ]},
            { field: "email", validations: [
                { type: "required", message: "El email del sitio es requerido" },
                { type: "email", message: "El email del sitio no es válido" },
            ]},
            { field: "capacity", validations: [
                { type: "required", message: "La capacidad del sitio es requerida" },
                { type: "number", message: "La capacidad del sitio debe ser un número" },
                { type: "min", value: 1, message: "La capacidad del sitio debe ser al menos 1" },
            ]},
            { field: "status", validations: [
                { type: "required", message: "El estado del sitio es requerido" },
                { type: "in", value: ["ACTIVE", "INACTIVE"], message: "El estado del sitio debe ser ACTIVE o INACTIVE" },
            ]},
        ];
        validateFields(req.body, validations, res);
        const { id } = req.params;
        const { name, description = null, ubication, direction, phone, email, capacity, status } = req.body;
        const updatedSite = await prisma.sites.update({
            where: { id: parseInt(id), deletedAt: null },
            data: { name, description, ubication, direction, phone, email, capacity, status }
        });
        return res.json(successResponse("Sitio actualizado", updatedSite, 200));
    }
    catch (error) {
        next(error);
    }
}

exports.deleteSite = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = parseInt(req.user.id);
        const deletedSite = await prisma.sites.update({
            where: { id: parseInt(id), deletedAt: null, userId },
            data: { deletedAt: new Date() }
        });
        return res.json(successResponse("Sitio eliminado", deletedSite, 200));
    }
    catch (error) {
        next(error);
    }
}

exports.getSites = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, all = false } = req.query;
        const where = { deletedAt: null };

        if(req.user.role.id !== 1){
            where.userId = parseInt(req.user.id);
        }

        let query = {
            where,
            include: {
                events: {
                    where: { deletedAt: null },
                    select: {
                        name: true,
                        type: true,
                        status: true,
                        description: true,
                        startTime: true,
                        endTime: true,
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
        const [sites, total] = await Promise.all([
            prisma.sites.findMany(query),
            prisma.sites.count({ where })
        ]);
        return res.json(successResponse("Sitios obtenidos", {
            data: sites,
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