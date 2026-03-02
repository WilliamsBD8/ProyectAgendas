const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  console.log("🌱 Seeding database...");

  // Crear permisos si no existen (findFirst + create para no depender de campo único)

  const permissions = [
    { name: "CREATE_ROLE", type: "CREATE", id: null },
    { name: "READ_ROLES", type: "READ", id: null },
    { name: "UPDATE_ROLE", type: "UPDATE", id: null },
    { name: "DELETE_ROLE", type: "DELETE", id: null },
    { name: "CREATE_PERMISSION", type: "CREATE", id: null },
    { name: "READ_PERMISSIONS", type: "READ", id: null },
    { name: "ASSIGN_PERMISSION_TO_ROLE", type: "CREATE", id: null },
  ];

  for (const permission of permissions) {
    const existingPermission = await prisma.permissions.findFirst({ where: { name: permission.name } });
    if (!existingPermission) {
      const newPermission = await prisma.permissions.create({ data: { name: permission.name, type: permission.type } });
      permission.id = newPermission.id;
    }else{
      permission.id = existingPermission.id;
    }
  }

  console.log("✅ Permisos creados:", permissions);

  // Crear roles si no existen (findFirst + create para no depender de campo único)
  const roles = [
    { name: "admin", id: null },
    { name: "administrator", id: null },  
    { name: "user", id: null },
  ];
  
  for (const role of roles) {
    const existingRole = await prisma.roles.findFirst({ where: { name: role.name } });
    if (!existingRole) {
      if(role.name === "administrator") {
        const newRole = await prisma.roles.create(
          { data:
            { name: role.name, rolePermissions: { create: permissions.map(p => ({ permissionId: p.id })) }
            }
          }
        );
        role.id = newRole.id;
      }else{
        const newRole = await prisma.roles.create({ data: { name: role.name } });
        role.id = newRole.id;
      }
    }else{
      role.id = existingRole.id;
    }
  }

  console.log("✅ Roles creados:", roles);

  const hashedPassword = await bcrypt.hash("123456", 10);

  const users = [
    { name: "Admin", email: "admin@email.com", password: hashedPassword, roleId: roles.find(r => r.name === "admin").id },
    { name: "Administrator", email: "administrator@email.com", password: hashedPassword, roleId: roles.find(r => r.name === "administrator").id },
    { name: "William Bonilla", email: "wsbonilladiaz@gmail.com", password: hashedPassword, roleId: roles.find(r => r.name === "user").id },
  ];

  for (const user of users) {
    const existingUser = await prisma.user.findFirst({ where: { email: user.email } });
    if (!existingUser) {
      await prisma.user.create({ data: { name: user.name, email: user.email, password: user.password, roleId: user.roleId } });
    }
  }
  console.log("✅ Usuarios creados:", users);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });