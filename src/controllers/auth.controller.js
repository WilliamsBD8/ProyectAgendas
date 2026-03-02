const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = require("../config/prisma/prisma");

const { successResponse } = require("../config/interfaces/success.interface");
const { errorResponse } = require("../config/interfaces/errors.interface");

const { validateFields } = require("../config/utils/rulesValidations");

exports.register = async (req, res, next) => {
    try {

        const validations = [
            { field: "name", validations: [
                { type: "required", message: "El nombre es requerido" },
                // { type: "string", message: "El nombre debe ser una cadena de texto" },
                { type: "min",value: 3, message: "El nombre debe tener al menos 3 caracteres" },
                { type: "max",value: 50, message: "El nombre debe tener menos de 50 caracteres" },
            ]},
            { field: "email", validations: [
                { type: "required", message: "El email es requerido" },
                { type: "email", message: "El email no es válido" },
            ]},
            { field: "password", validations: [
                { type: "required", message: "La contraseña es requerida" },
                { type: "min",value: 8, message: "La contraseña debe tener al menos 8 caracteres" },
                { type: "max",value: 50, message: "La contraseña debe tener menos de 50 caracteres" },
            ]},
        ];

        validateFields(req.body, validations, res);

        const { name = "", email = "", password = "", roleId = 2 } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
    
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                roleId,
            }
        });
  
        return res.json(successResponse("Usuario registrado", newUser, 201));
    } catch (error) {
        next(error);
    }
};
  
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const validations = [
            { field: "email", validations: [
                { type: "required", message: "El email es requerido" },
                { type: "email", message: "El email no es válido" },
            ]},
            { field: "password", validations: [
                { type: "required", message: "La contraseña es requerida" },
            ]},
        ];

        validateFields(req.body, validations, res);
    
        const user = await prisma.user.findFirst({
            where: { email, deletedAt: null },
            include: {
                role: true,
            }
        });
    
        if (!user) {
            throw new Error("Usuario o contraseña incorrecta");
        }

        if (user.status === "INACTIVE") {
            throw new Error("Usuario inactivo");
        }
    
        const validPassword = await bcrypt.compare(password, user.password);
    
        if (!validPassword) {
            throw new Error("Usuario o contraseña incorrecta");
        }
    
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: parseInt(process.env.JWT_EXPIRES_IN || "3600") }
        );

        await prisma.tokensUser.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + parseInt(process.env.JWT_EXPIRES_IN || "3600") * 1000),
            }
        });

        const userData = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.name,
                status: user.status,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            token
        };

        return res.json(successResponse("Login exitoso", userData, 200));
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        const { token } = req.body;
        await prisma.tokensUser.update({
            where: { token, deletedAt: null },
            data: {
                deletedAt: new Date(),
            }
        });
        return res.json(successResponse("Logout exitoso", null, 200));
    } catch (error) {
        next(error);
    }
};