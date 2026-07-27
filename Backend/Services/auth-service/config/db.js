import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

console.log("Connecting to MySQL database...");
console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log(`DB_PORT: ${process.env.DB_PORT}`);
console.log(`DB_USER: ${process.env.DB_USER}`);
console.log(`DB_NAME: ${process.env.DB_NAME}`);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // Helps keep idle connections alive
  enableKeepAlive: true,
});

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();

    console.log("✅ MySQL Connected Successfully");

    connection.release();
  } catch (error) {
    console.error("❌ MySQL Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
};

export { pool, connectDB };