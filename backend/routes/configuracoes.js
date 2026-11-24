
const express = require("express");
const pool = require("../db");
const { verificarAutenticacao } = require("../middleware/auth");

const router = express.Router();

router.use(verificarAutenticacao);

// BUSCAR CONFIGURAÇÕES
router.get("/", async (req, res) => {
    try {
        const usuarioId = req.session.usuario.id;

        const resultado = await pool.query(
            `SELECT * FROM configuracoes
             WHERE usuario_id = $1`,
            [usuarioId]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Configurações não encontradas."
            });
        }

        res.json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao buscar configurações."
        });
    }
});

// ATUALIZAR CONFIGURAÇÕES
router.put("/", async (req, res) => {
    try {
        const usuarioId = req.session.usuario.id;

        const {
            tema,
            notificacoes,
            notificacoes_email,
            formato_horario,
            primeiro_dia_semana
        } = req.body;

        if (!["claro", "escuro"].includes(tema)) {
            return res.status(400).json({
                mensagem: "Tema inválido."
            });
        }

        if (!["12h", "24h"].includes(formato_horario)) {
            return res.status(400).json({
                mensagem: "Formato de horário inválido."
            });
        }

        if (!["segunda", "domingo"].includes(primeiro_dia_semana)) {
            return res.status(400).json({
                mensagem: "Primeiro dia da semana inválido."
            });
        }

        const resultado = await pool.query(
            `UPDATE configuracoes
             SET tema = $1,
                 notificacoes = $2,
                 notificacoes_email = $3,
                 formato_horario = $4,
                 primeiro_dia_semana = $5
             WHERE usuario_id = $6
             RETURNING *`,
            [
                tema,
                notificacoes,
                notificacoes_email,
                formato_horario,
                primeiro_dia_semana,
                usuarioId
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Configurações não encontradas."
            });
        }

        res.json({
            mensagem: "Configurações atualizadas!",
            configuracoes: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao atualizar configurações."
        });
    }
});

module.exports = router;
