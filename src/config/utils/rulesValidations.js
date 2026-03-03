const { errorResponse } = require("../interfaces/errors.interface");

function isValidDateTime(value) {
    const date = new Date(value);
    return !isNaN(date.getTime());
}

function parseDateTime(value) {
    return new Date(value); // se puede convertir a ISO si quieres
}

exports.validateFields = (body, fields, res) => {
    const errors = [];

    Object.keys(body).forEach(key => {
        if (!fields.some(field => field.field === key)) {
            errors.push({ field: key, message: "Campo no permitido" });
        }
    });

    if (errors.length > 0)
        return res.json(errorResponse("Errores de validación", errors, 401));

    fields.forEach(field => {
        // Si el campo no existe y es required, agregamos error y saltamos a siguiente campo
        const value = body[field.field];
        const hasDateTimeValidation = field.validations.some(v => v.type === "datetime");

        const isRequired = field.validations.some(v => v.type === "required");
        if (isRequired && (value === undefined || value === null || value === "")) {
            errors.push({ field: field.field, message: field.validations.find(v => v.type === "required").message });
            return; // <-- pasa al siguiente field
        }

        field.validations.forEach(validation => {

            switch (validation.type) {
                case "min":
                    if (hasDateTimeValidation && isValidDateTime(value) && isValidDateTime(validation.value)) {
                        // Comparación de fechas
                        const minDate = validation.value instanceof Date ? validation.value : new Date(validation.value);
                        if (new Date(value) < minDate) {
                            errors.push({ field: field.field, message: validation.message });
                        }
                    }else if (typeof value === "string" && value.length < validation.value) {
                        errors.push({ field: field.field, message: validation.message });
                    } else if (typeof value === "number" && value < validation.value) {
                        errors.push({ field: field.field, message: validation.message });
                    }
                    break;
                case "max":
                    if (hasDateTimeValidation && isValidDateTime(value) && isValidDateTime(validation.value)) {
                        // Comparación de fechas
                        const maxDate = validation.value instanceof Date ? validation.value : new Date(validation.value);
                        if (new Date(value) > maxDate) {
                            errors.push({ field: field.field, message: validation.message });
                        }
                    }else if (typeof value === "string" && value.length > validation.value) {
                        errors.push({ field: field.field, message: validation.message });
                    } else if (typeof value === "number" && value > validation.value) {
                        errors.push({ field: field.field, message: validation.message });
                    }
                    break;
                case "string":
                    if (typeof value !== "string") {
                        errors.push({ field: field.field, message: validation.message });
                    }
                    break;
                case "email":
                    if (!value.includes("@")) {
                        errors.push({ field: field.field, message: validation.message });
                    }
                    break;

                case "in":
                    if (!validation.value.includes(value)) {
                        errors.push({ field: field.field, message: validation.message });
                    }
                    break;
                case "array":
                    if (!Array.isArray(value)) {
                        errors.push({ field: field.field, message: validation.message });
                    }
                    break;
                case "number":
                    if (typeof value !== "number") {
                        errors.push({ field: field.field, message: validation.message });
                    } else if (isNaN(value)) {
                        errors.push({ field: field.field, message: validation.message });
                    }
                    break;
                case "boolean":
                    if (value !== true && value !== false) {
                        errors.push({ field: field.field, message: validation.message });
                    }
                    break;

                case 'datetime':
                    if (!isValidDateTime(value)) {
                        errors.push({ field: field.field, message: validation.message });
                    } else {
                        body[field.field] = parseDateTime(value); // convertir solo si es válido
                    }
                    break;
                default:
                    break;
            }
        });
    });

    if (errors.length > 0)
        return res.json(errorResponse("Errores de validación", errors, 401));
}
