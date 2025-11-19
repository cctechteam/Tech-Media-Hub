// For the case of gaining access if Database is blank

const Database = require("better-sqlite3");

const db = new Database("db.sqlite");

const userEmail = process.argv[2];

if (!userEmail) {
  console.log("Usage: node add-tech-role.js <your-email@example.com>");
  console.log("\nAvailable users:");
  const users = db.prepare("SELECT id, email, full_name FROM members").all();
  users.forEach(u => console.log(`  ${u.id}: ${u.email} (${u.full_name})`));
  process.exit(1);
}

const user = db.prepare("SELECT * FROM members WHERE email = ?").get(userEmail);

if (!user) {
  console.log(`❌ User with email '${userEmail}' not found`);
  process.exit(1);
}

console.log(`Found user: ${user.full_name} (${user.email})`);

const techRole = db.prepare("SELECT * FROM roles WHERE role_name = 'tech_team'").get();

if (!techRole) {
  console.log("❌ tech_team role not found in database");
  process.exit(1);
}

const existingRole = db.prepare(`
  SELECT * FROM member_roles 
  WHERE member_id = ? AND role_id = ?
`).get(user.id, techRole.id);

if (existingRole) {
  console.log("✓ User already has tech_team role!");
  process.exit(0);
}

db.prepare(`
  INSERT INTO member_roles (member_id, role_id)
  VALUES (?, ?)
`).run(user.id, techRole.id);

console.log("✓ Successfully added tech_team role!");

const roles = db.prepare(`
  SELECT r.role_name, r.display_name 
  FROM roles r
  INNER JOIN member_roles mr ON r.id = mr.role_id
  WHERE mr.member_id = ?
`).all(user.id);

console.log("\nCurrent roles:");
roles.forEach(r => console.log(`  - ${r.display_name} (${r.role_name})`));
