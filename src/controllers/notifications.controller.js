const prisma = require("../config/prisma/prisma");
const { successResponse } = require("../config/interfaces/success.interface");
const { validateFields } = require("../config/utils/rulesValidations");

exports.createNotification = async (req, res, next) => {
    try {
        const validations = [
            { field: "title", validations: [
                { type: "required", message: "El título es requerido" },
                { type: "min", value: 3, message: "El título debe tener al menos 3 caracteres" },
                { type: "max", value: 100, message: "El título debe tener menos de 100 caracteres" },
            ]},
            { field: "message", validations: [
                { type: "required", message: "El mensaje es requerido" },
                { type: "min", value: 3, message: "El mensaje debe tener al menos 3 caracteres" },
                { type: "max", value: 500, message: "El mensaje debe tener menos de 500 caracteres" },
            ]},
            { field: "userId", validations: [
                { type: "required", message: "El usuario es requerido" },
                { type: "number", message: "El usuario debe ser un número" },
            ]},
        ];

        const validationErrors = validateFields(req.body, validations, res);
        if (validationErrors) return;

        const { title, message, userId } = req.body;

        const notification = await prisma.notifications.create({
            data: {
                title,
                message,
                userId: parseInt(userId),
            }
        });

        return res.json(successResponse("Notificación creada", notification, 201));
    } catch (error) {
        next(error);
    }
};

exports.getNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, all = false, userId, onlyUnread = false } = req.query;
        const where = { deletedAt: null };

        if (req.user.role.id === 1 && userId) {
            where.userId = parseInt(userId);
        } else if (req.user.role.id !== 1) {
            where.userId = parseInt(req.user.id);
        }

        if (onlyUnread === "true") {
            where.isRead = false;
        }

        const query = {
            where,
            include: {
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

        const [notifications, total] = await Promise.all([
            prisma.notifications.findMany(query),
            prisma.notifications.count({ where })
        ]);

        return res.json(successResponse("Notificaciones obtenidas", {
            data: notifications,
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

exports.markNotificationAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;

        const where = {
            id: parseInt(id),
            deletedAt: null,
        };

        if (req.user.role.id !== 1) {
            where.userId = parseInt(req.user.id);
        }

        const notification = await prisma.notifications.findFirst({ where });

        if (!notification) {
            throw new Error("La notificación no existe");
        }

        const updatedNotification = await prisma.notifications.update({
            where: { id: notification.id },
            data: { isRead: true }
        });

        return res.json(successResponse("Notificación marcada como leída", updatedNotification, 200));
    } catch (error) {
        next(error);
    }
};
