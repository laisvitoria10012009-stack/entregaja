
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");

const router = express.Router();

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: "Informe o e-mail e a senha."
            });
        }

        const resultado = await pool.query(
            "SELECT * FROM usuarios WHERE email = $1",
            [email]
        );

        if (resultado.rows.length === 0) {
            return res.status(401).json({
                mensagem: "E-mail ou senha incorretos."
            });
        }

        const usuario = resultado.rows[0];

        let senhaValida = false;

        if (usuario.senha.startsWith("$2")) {
            senhaValida = await bcrypt.compare(
                senha,
                usuario.senha
            );
        } else {
            senhaValida = senha === usuario.senha;
        }

        if (!senhaValida) {
            return res.status(401).json({
                mensagem: "E-mail ou senha incorretos."
            });
        }

        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        };

        return res.status(200).json({
            mensagem: "Login realizado com sucesso!",
            usuario: req.session.usuario
        });

    } catch (error) {
        console.error("Erro no login:", error);

        return res.status(500).json({
            mensagem: "Erro interno ao realizar login."
        });
    }
});

// USUÁRIO LOGADO
router.get("/me", (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    res.json(req.session.usuario);
});

// LOGOUT
router.post("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                mensagem: "Não foi possível sair."
            });
        }

        res.clearCookie("connect.sid");

        return res.json({
            mensagem: "Logout realizado com sucesso."
        });
    });
});

module.exports = router;
