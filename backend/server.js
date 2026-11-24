
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");

const pool = require("./db");

const authRoutes = require("./routes/auth");
const atividadesRoutes = require("./routes/atividades");
const eventosRoutes = require("./routes/eventos");
const configuracoesRoutes = require("./routes/configuracoes");
const recuperacaoRoutes = require("./routes/recuperacao");

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use("/api/auth", authRoutes);
app.use("/api/atividades", atividadesRoutes);
app.use("/api/eventos", eventosRoutes);
app.use("/api/configuracoes", configuracoesRoutes);
app.use("/api/recuperacao", recuperacaoRoutes);

app.get("/", (req, res) => {
    res.json({
        mensagem: "API EntregaJá funcionando!"
    });
});

// TESTAR CONEXÃO COM O BANCO
app.get("/api/status-db", async (req, res) => {
    try {
        const resultado = await pool.query("SELECT NOW() AS horario");

        res.json({
            mensagem: "Conexão com PostgreSQL realizada com sucesso!",
            horario: resultado.rows[0].horario
        });
    } catch (erro) {
        console.error("Erro ao testar banco:", erro.message);

        res.status(500).json({
            mensagem: "Não foi possível conectar ao PostgreSQL."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor EntregaJá rodando na porta ${PORT}`);
});
