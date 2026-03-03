const crypto = require("crypto");
const prisma = require("../config/prisma/prisma");
const { successResponse } = require("../config/interfaces/success.interface");
const { validateFields } = require("../config/utils/rulesValidations");

async function generateUniqueQrCode() {
    let codeQr = "";
    let exists = true;

    while (exists) {
        codeQr = `TKT-${crypto.randomUUID()}`;
        const existingTicket = await prisma.tickets.findFirst({
            where: { codeQr }
        });
        exists = !!existingTicket;
    }

    return codeQr;
}

exports.createTicket = async (req, res, next) => {
    try {
        const validations = [
            { field: "eventId", validations: [
                { type: "required", message: "El evento es requerido" },
                { type: "number", message: "El evento debe ser un número" },
            ]},
        ];

        const validationErrors = validateFields(req.body, validations, res);
        if (validationErrors) return;

        const { eventId } = req.body;
        const userId = parseInt(req.user.id);

        const event = await prisma.events.findFirst({
            where: { id: parseInt(eventId), deletedAt: null },
            include: {
                site: {
                    select: {
                        id: true,
                        name: true,
                        capacity: true,
                    }
                }
            }
        });

        if (!event) {
            throw new Error("El evento no existe");
        }

        if (["CANCELLED", "COMPLETED", "ARCHIVED"].includes(event.status)) {
            throw new Error("No es posible adquirir boletas para este evento por su estado actual");
        }

        const existingUserTicket = await prisma.tickets.findFirst({
            where: {
                eventId: parseInt(eventId),
                userId,
                deletedAt: null,
                status: "ACTIVE"
            }
        });

        if (existingUserTicket) {
            throw new Error("Ya tienes una boleta activa para este evento");
        }

        const capacity = parseInt(event.site.capacity || 0);
        if (capacity <= 0) {
            throw new Error("El evento no tiene aforo disponible");
        }

        const soldTickets = await prisma.tickets.count({
            where: {
                eventId: parseInt(eventId),
                deletedAt: null,
                status: "ACTIVE"
            }
        });

        if (soldTickets >= capacity) {
            throw new Error("No hay boletas disponibles, se alcanzó el aforo máximo del evento");
        }

        const codeQr = await generateUniqueQrCode();

        const newTicket = await prisma.tickets.create({
            data: {
                codeQr,
                eventId: parseInt(eventId),
                userId,
            },
            include: {
                event: {
                    select: {
                        id: true,
                        name: true,
                        startTime: true,
                        endTime: true,
                    }
                }
            }
        });

        return res.json(successResponse("Boleta creada", newTicket, 201));
    } catch (error) {
        next(error);
    }
};

exports.getTickets = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, all = false, eventId } = req.query;
        const userId = parseInt(req.user.id);

        const where = { deletedAt: null };

        if (eventId) {
            where.eventId = parseInt(eventId);
        }

        if (req.user.role.id !== 1) {
            where.userId = userId;
        }

        const query = {
            where,
            include: {
                event: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        startTime: true,
                        endTime: true,
                        site: {
                            select: {
                                name: true,
                            }
                        }
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: {
                id: "desc",
            }
        };

        if (!all || all === "false") {
            query.skip = (parseInt(page) - 1) * parseInt(limit);
            query.take = parseInt(limit);
        }

        const [tickets, total] = await Promise.all([
            prisma.tickets.findMany(query),
            prisma.tickets.count({ where })
        ]);

        return res.json(successResponse("Boletas obtenidas", {
            data: tickets,
            pagination: {
                page,
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
            }
        }, 200));
    } catch (error) {
        next(error);
    }
};

exports.validateTicket = async (req, res, next) => {
    try {
        const { codeQr } = req.params;

        const ticket = await prisma.tickets.findFirst({
            where: {
                codeQr,
                deletedAt: null,
                status: "ACTIVE"
            },
            include: {
                event: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    }
                }
            }
        });

        if (!ticket) {
            throw new Error("La boleta no existe o no está activa");
        }

        if (ticket.validated) {
            throw new Error("La boleta ya fue validada anteriormente");
        }

        if (!["IN_PROGRESS", "CONFIRMED"].includes(ticket.event.status)) {
            throw new Error("No se puede validar boletas para este evento por su estado actual");
        }

        const validatedTicket = await prisma.tickets.update({
            where: { id: ticket.id },
            data: {
                validated: true,
                validatedAt: new Date(),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                event: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        return res.json(successResponse("Boleta validada correctamente", validatedTicket, 200));
    } catch (error) {
        next(error);
    }
};
