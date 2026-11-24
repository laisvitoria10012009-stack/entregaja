
const pg = require("pg");

const { Pool } = pg;

// Configuração do PostgreSQL
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "entregaja",
    password: "senai",
    port: 5432
});

pool.on("connect", () => {
    console.log("Conectado ao PostgreSQL!");
});

pool.on("error", (erro) => {
    console.error("Erro na conexão com PostgreSQL:", erro.message);
});

module.exports = pool;
