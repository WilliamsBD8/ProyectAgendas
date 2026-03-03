const serverUrl = process.env.SWAGGER_SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;

module.exports = {
  openapi: "3.0.3",
  info: {
    title: "Eventos API",
    version: "1.0.0",
    description: "Documentación completa del backend (módulos 1, 2, 3 y 4) con autenticación JWT y permisos por rol.",
  },
  servers: [
    {
      url: serverUrl,
      description: "Servidor actual",
    },
  ],
  tags: [
    { name: "Auth", description: "Autenticación y gestión de sesión" },
    { name: "Security", description: "Roles y permisos" },
    { name: "Sites", description: "Gestión de sitios" },
    { name: "Events", description: "Gestión de eventos" },
    { name: "Agendas", description: "Itinerario de eventos" },
    { name: "Tickets", description: "Boletería y validación en puerta" },
    { name: "Notifications", description: "Sistema de notificaciones" },
    { name: "Surveys", description: "Encuestas y respuestas" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operación realizada correctamente." },
          data: { type: "object", nullable: true },
          status: { type: "integer", example: 200 },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error en la operación." },
          data: { type: "object", nullable: true },
          status: { type: "integer", example: 400 },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Juan Pérez" },
          email: { type: "string", format: "email", example: "juan@email.com" },
          password: { type: "string", example: "12345678" },
          roleId: { type: "integer", example: 2 },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@email.com" },
          password: { type: "string", example: "123456" },
        },
      },
      LogoutRequest: {
        type: "object",
        required: ["token"],
        properties: {
          token: { type: "string", example: "jwt.token.aqui" },
        },
      },
      RoleRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "asistente" },
        },
      },
      PermissionRequest: {
        type: "object",
        required: ["name", "type"],
        properties: {
          name: { type: "string", example: "READ_EVENTS" },
          type: { type: "string", enum: ["CREATE", "READ", "UPDATE", "DELETE"], example: "READ" },
        },
      },
      AssignPermissionsRequest: {
        type: "object",
        required: ["roleId", "permissionIds"],
        properties: {
          roleId: { type: "integer", example: 2 },
          permissionIds: {
            type: "array",
            items: { type: "integer" },
            example: [8, 9, 12],
          },
        },
      },
      SiteRequest: {
        type: "object",
        required: ["name", "ubication", "direction", "phone", "email", "capacity"],
        properties: {
          name: { type: "string", example: "Centro de Convenciones" },
          description: { type: "string", example: "Sala principal" },
          ubication: { type: "string", example: "Bogotá" },
          direction: { type: "string", example: "Calle 123 #45-67" },
          phone: { type: "string", example: "3001234567" },
          email: { type: "string", format: "email", example: "sitio@email.com" },
          capacity: { type: "integer", example: 500 },
          status: { type: "string", enum: ["ACTIVE", "INACTIVE"], example: "ACTIVE" },
        },
      },
      EventRequest: {
        type: "object",
        required: ["name", "type", "description", "startTime", "endTime", "siteId"],
        properties: {
          name: { type: "string", example: "Conferencia Tech" },
          type: { type: "string", enum: ["PUBLIC", "PRIVATE"], example: "PUBLIC" },
          status: { type: "string", enum: ["PENDING", "IN_PROGRESS", "CONFIRMED", "CANCELLED", "COMPLETED", "ARCHIVED"], example: "PENDING" },
          description: { type: "string", example: "Evento de tecnología" },
          startTime: { type: "string", format: "date-time", example: "2026-04-10T08:00:00.000Z" },
          endTime: { type: "string", format: "date-time", example: "2026-04-10T12:00:00.000Z" },
          siteId: { type: "integer", example: 1 },
        },
      },
      AgendaRequest: {
        type: "object",
        required: ["activity", "startTime", "endTime", "eventId"],
        properties: {
          activity: { type: "string", example: "Registro de asistentes" },
          startTime: { type: "string", format: "date-time", example: "2026-04-10T08:00:00.000Z" },
          endTime: { type: "string", format: "date-time", example: "2026-04-10T09:00:00.000Z" },
          eventId: { type: "integer", example: 1 },
          status: { type: "string", enum: ["PENDING", "IN_PROGRESS", "CONFIRMED", "CANCELLED", "COMPLETED", "ARCHIVED"], example: "PENDING" },
        },
      },
      TicketRequest: {
        type: "object",
        required: ["eventId"],
        properties: {
          eventId: { type: "integer", example: 1 },
        },
      },
      NotificationRequest: {
        type: "object",
        required: ["title", "message", "userId"],
        properties: {
          title: { type: "string", example: "Cambio de horario" },
          message: { type: "string", example: "El evento iniciará 30 minutos más tarde" },
          userId: { type: "integer", example: 3 },
        },
      },
      SurveyRequest: {
        type: "object",
        required: ["titleSurvey", "eventId"],
        properties: {
          titleSurvey: { type: "string", example: "¿Cómo calificarías el evento?" },
          eventId: { type: "integer", example: 1 },
        },
      },
      SurveyResponseRequest: {
        type: "object",
        required: ["surveyId", "stars"],
        properties: {
          surveyId: { type: "integer", example: 1 },
          stars: { type: "integer", minimum: 1, maximum: 5, example: 5 },
          comment: { type: "string", example: "Excelente organización" },
        },
      },
    },
  },
  paths: {
    "/": {
      get: {
        tags: ["Auth"],
        summary: "Health básico",
        responses: {
          200: { description: "OK" },
        },
      },
    },
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar usuario",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          200: { description: "Usuario registrado" },
          400: { description: "Error de validación", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesión",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: { description: "Login exitoso" },
          400: { description: "Credenciales inválidas", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Cerrar sesión",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LogoutRequest" },
            },
          },
        },
        responses: {
          200: { description: "Logout exitoso" },
          401: { description: "No autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },

    "/api/v1/security/store-role": { post: { tags: ["Security"], summary: "Crear rol", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RoleRequest" } } } }, responses: { 200: { description: "Rol creado" } } } },
    "/api/v1/security/update-role/{id}": { put: { tags: ["Security"], summary: "Actualizar rol", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RoleRequest" } } } }, responses: { 200: { description: "Rol actualizado" } } } },
    "/api/v1/security/delete-role/{id}": { delete: { tags: ["Security"], summary: "Eliminar rol", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Rol eliminado" } } } },
    "/api/v1/security/get-roles": { get: { tags: ["Security"], summary: "Listar roles", security: [{ bearerAuth: [] }], parameters: [{ in: "query", name: "page", schema: { type: "integer" } }, { in: "query", name: "limit", schema: { type: "integer" } }, { in: "query", name: "all", schema: { type: "boolean" } }], responses: { 200: { description: "Roles obtenidos" } } } },
    "/api/v1/security/get-permissions": { get: { tags: ["Security"], summary: "Listar permisos", security: [{ bearerAuth: [] }], parameters: [{ in: "query", name: "page", schema: { type: "integer" } }, { in: "query", name: "limit", schema: { type: "integer" } }, { in: "query", name: "all", schema: { type: "boolean" } }], responses: { 200: { description: "Permisos obtenidos" } } } },
    "/api/v1/security/create-permission": { post: { tags: ["Security"], summary: "Crear permiso", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PermissionRequest" } } } }, responses: { 200: { description: "Permiso creado" } } } },
    "/api/v1/security/assign-permission-to-role": { post: { tags: ["Security"], summary: "Asignar permisos a rol", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AssignPermissionsRequest" } } } }, responses: { 200: { description: "Permisos asignados" } } } },

    "/api/v1/sites/create-site": { post: { tags: ["Sites"], summary: "Crear sitio", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SiteRequest" } } } }, responses: { 200: { description: "Sitio creado" } } } },
    "/api/v1/sites/update-site/{id}": { put: { tags: ["Sites"], summary: "Actualizar sitio", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SiteRequest" } } } }, responses: { 200: { description: "Sitio actualizado" } } } },
    "/api/v1/sites/delete-site/{id}": { delete: { tags: ["Sites"], summary: "Eliminar sitio", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Sitio eliminado" } } } },
    "/api/v1/sites/get-sites": { get: { tags: ["Sites"], summary: "Listar sitios", security: [{ bearerAuth: [] }], parameters: [{ in: "query", name: "page", schema: { type: "integer" } }, { in: "query", name: "limit", schema: { type: "integer" } }, { in: "query", name: "all", schema: { type: "boolean" } }], responses: { 200: { description: "Sitios obtenidos" } } } },

    "/api/v1/events/create-event": { post: { tags: ["Events"], summary: "Crear evento", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EventRequest" } } } }, responses: { 200: { description: "Evento creado" } } } },
    "/api/v1/events/update-event/{id}": { put: { tags: ["Events"], summary: "Actualizar evento", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EventRequest" } } } }, responses: { 200: { description: "Evento actualizado" } } } },
    "/api/v1/events/delete-event/{id}": { delete: { tags: ["Events"], summary: "Eliminar evento", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Evento eliminado" } } } },
    "/api/v1/events/get-events": { get: { tags: ["Events"], summary: "Listar eventos", security: [{ bearerAuth: [] }], parameters: [{ in: "query", name: "page", schema: { type: "integer" } }, { in: "query", name: "limit", schema: { type: "integer" } }, { in: "query", name: "all", schema: { type: "boolean" } }], responses: { 200: { description: "Eventos obtenidos" } } } },

    "/api/v1/agendas/create-agenda": { post: { tags: ["Agendas"], summary: "Crear agenda", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AgendaRequest" } } } }, responses: { 200: { description: "Agenda creada" } } } },
    "/api/v1/agendas/update-agenda/{id}": { put: { tags: ["Agendas"], summary: "Actualizar agenda", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AgendaRequest" } } } }, responses: { 200: { description: "Agenda actualizada" } } } },
    "/api/v1/agendas/delete-agenda/{id}": { delete: { tags: ["Agendas"], summary: "Eliminar agenda", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Agenda eliminada" } } } },

    "/api/v1/tickets/create-ticket": { post: { tags: ["Tickets"], summary: "Adquirir boleta", description: "Valida aforo máximo y genera QR único.", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TicketRequest" } } } }, responses: { 200: { description: "Boleta creada" } } } },
    "/api/v1/tickets/get-tickets": { get: { tags: ["Tickets"], summary: "Listar boletas", security: [{ bearerAuth: [] }], parameters: [{ in: "query", name: "page", schema: { type: "integer" } }, { in: "query", name: "limit", schema: { type: "integer" } }, { in: "query", name: "all", schema: { type: "boolean" } }, { in: "query", name: "eventId", schema: { type: "integer" } }], responses: { 200: { description: "Boletas obtenidas" } } } },
    "/api/v1/tickets/validate-ticket/{codeQr}": { put: { tags: ["Tickets"], summary: "Validar boleta en puerta", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "codeQr", required: true, schema: { type: "string" } }], responses: { 200: { description: "Boleta validada" } } } },

    "/api/v1/notifications/create-notification": { post: { tags: ["Notifications"], summary: "Crear notificación", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/NotificationRequest" } } } }, responses: { 200: { description: "Notificación creada" } } } },
    "/api/v1/notifications/get-notifications": { get: { tags: ["Notifications"], summary: "Listar notificaciones", security: [{ bearerAuth: [] }], parameters: [{ in: "query", name: "page", schema: { type: "integer" } }, { in: "query", name: "limit", schema: { type: "integer" } }, { in: "query", name: "all", schema: { type: "boolean" } }, { in: "query", name: "userId", schema: { type: "integer" } }, { in: "query", name: "onlyUnread", schema: { type: "boolean" } }], responses: { 200: { description: "Notificaciones obtenidas" } } } },
    "/api/v1/notifications/mark-notification-as-read/{id}": { put: { tags: ["Notifications"], summary: "Marcar notificación como leída", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Notificación actualizada" } } } },

    "/api/v1/surveys/create-survey": { post: { tags: ["Surveys"], summary: "Crear encuesta", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SurveyRequest" } } } }, responses: { 200: { description: "Encuesta creada" } } } },
    "/api/v1/surveys/get-surveys": { get: { tags: ["Surveys"], summary: "Listar encuestas", security: [{ bearerAuth: [] }], parameters: [{ in: "query", name: "page", schema: { type: "integer" } }, { in: "query", name: "limit", schema: { type: "integer" } }, { in: "query", name: "all", schema: { type: "boolean" } }, { in: "query", name: "eventId", schema: { type: "integer" } }], responses: { 200: { description: "Encuestas obtenidas" } } } },
    "/api/v1/surveys/create-survey-response": { post: { tags: ["Surveys"], summary: "Responder encuesta", description: "Disponible para asistentes con boleta validada.", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SurveyResponseRequest" } } } }, responses: { 200: { description: "Respuesta creada" } } } },
    "/api/v1/surveys/get-survey-responses": { get: { tags: ["Surveys"], summary: "Listar respuestas de encuestas", security: [{ bearerAuth: [] }], parameters: [{ in: "query", name: "page", schema: { type: "integer" } }, { in: "query", name: "limit", schema: { type: "integer" } }, { in: "query", name: "all", schema: { type: "boolean" } }, { in: "query", name: "surveyId", schema: { type: "integer" } }], responses: { 200: { description: "Respuestas obtenidas" } } } },
  },
};
