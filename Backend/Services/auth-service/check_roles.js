import { pool } from './config/db.js';

const checkRoles = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT u.email, r.name as role 
      FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id
    `);
    console.log(rows);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
};
checkRoles();
