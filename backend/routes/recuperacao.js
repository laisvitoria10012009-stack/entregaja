
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const pool = require("../db");

const router = express.Router();

// SOLICITAR RECUPERAÇÃO
router.post("/solicitar", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                mensagem: "Informe seu e-mail."
            });
        }

        const resultado = await pool.query(
            `SELECT id FROM usuarios
             WHERE email = $1 AND ativo = TRUE`,
            [email]
        );

        if (resultado.rows.length === 0) {
            return res.json({
                mensagem: "Se o e-mail estiver cadastrado, haverá uma solicitação de recuperação."
            });
        }

        const usuarioId = resultado.rows[0].id;
        const token = crypto.randomBytes(32).toString("hex");

        const dataExpiracao = new Date(
            Date.now() + 30 * 60 * 1000
        );

        await pool.query(
            `INSERT INTO recuperacao_senha
             (usuario_id, token, data_expiracao)
             VALUES ($1, $2, $3)`,
            [usuarioId, token, dataExpiracao]
        );

        res.json({
            mensagem: "Solicitação de recuperação criada.",
            token: token
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao solicitar recuperação."
        });
    }
});

// REDEFINIR SENHA
router.post("/redefinir", async (req, res) => {
    const client = await pool.connect();

    try {
        const { token, novaSenha } = req.body;

        if (!token || !novaSenha || novaSenha.length < 6) {
            return res.status(400).json({
                mensagem: "Informe um token e uma nova senha com pelo menos 6 caracteres."
            });
        }

        await client.query("BEGIN");

        const resultado = await client.query(
            `SELECT id, usuario_id
             FROM recuperacao_senha
             WHERE token = $1
             AND utilizado = FALSE
             AND data_expiracao > CURRENT_TIMESTAMP
             FOR UPDATE`,
            [token]
        );

        if (resultado.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                mensagem: "Token inválido ou expirado."
            });
        }

        const recuperacao = resultado.rows[0];
        const senhaHash = await bcrypt.hash(novaSenha, 10);

        await client.query(
            `UPDATE usuarios
             SET senha = $1
             WHERE id = $2`,
            [senhaHash, recuperacao.usuario_id]
        );

        await client.query(
            `UPDATE recuperacao_senha
             SET utilizado = TRUE
             WHERE id = $1`,
            [recuperacao.id]
        );

        await client.query("COMMIT");

        res.json({
            mensagem: "Senha redefinida com sucesso!"
        });

    } catch (erro) {
        await client.query("ROLLBACK");

        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao redefinir senha."
        });

    } finally {
        client.release();
    }
});

module.exports = router;
