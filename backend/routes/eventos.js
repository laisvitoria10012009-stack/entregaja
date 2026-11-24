
const express = require("express");
const pool = require("../db");
const { verificarAutenticacao } = require("../middleware/auth");

const router = express.Router();

router.use(verificarAutenticacao);

// LISTAR EVENTOS
router.get("/", async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT *
            FROM eventos_academicos
            ORDER BY data_inicio ASC, horario_inicio ASC
        `);

        return res.status(200).json(resultado.rows);
    } catch (erro) {
        console.error("Erro ao listar eventos:", erro);
        return res.status(500).json({
            mensagem: "Erro ao carregar eventos.",
            detalhe: erro.message
        });
    }
});

// ADICIONAR EVENTO
router.post("/", async (req, res) => {
    try {
        const {
            titulo,
            descricao,
            data_inicio,
            data_fim,
            horario_inicio,
            horario_fim,
            categoria,
            cor,
            local
        } = req.body;

        if (!titulo || !titulo.trim() || !data_inicio) {
            return res.status(400).json({
                mensagem: "Título e data inicial são obrigatórios."
            });
        }

        if (data_fim && data_fim < data_inicio) {
            return res.status(400).json({
                mensagem: "A data final não pode ser anterior à inicial."
            });
        }

        if (
            horario_inicio &&
            horario_fim &&
            horario_fim <= horario_inicio
        ) {
            return res.status(400).json({
                mensagem: "O horário final deve ser posterior ao inicial."
            });
        }

        const usuarioId = req.session.usuario.id;

        const resultado = await pool.query(
            `INSERT INTO eventos_academicos (
                titulo,
                descricao,
                data_inicio,
                data_fim,
                horario_inicio,
                horario_fim,
                categoria,
                cor,
                local,
                criado_por
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *`,
            [
                titulo.trim(),
                descricao || null,
                data_inicio,
                data_fim || null,
                horario_inicio || null,
                horario_fim || null,
                categoria || "Acadêmico",
                cor || "#8B5CF6",
                local || null,
                usuarioId
            ]
        );

        return res.status(201).json({
            mensagem: "Evento cadastrado com sucesso!",
            evento: resultado.rows[0]
        });

    } catch (erro) {
        console.error("Erro ao cadastrar evento:", erro);

        return res.status(500).json({
            mensagem: "Erro ao cadastrar evento.",
            detalhe: erro.message
        });
    }
});

// EDITAR EVENTO
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            titulo,
            descricao,
            data_inicio,
            data_fim,
            horario_inicio,
            horario_fim,
            categoria,
            cor,
            local
        } = req.body;

        if (!titulo || !titulo.trim() || !data_inicio) {
            return res.status(400).json({
                mensagem: "Título e data inicial são obrigatórios."
            });
        }

        if (data_fim && data_fim < data_inicio) {
            return res.status(400).json({
                mensagem: "A data final não pode ser anterior à inicial."
            });
        }

        if (
            horario_inicio &&
            horario_fim &&
            horario_fim <= horario_inicio
        ) {
            return res.status(400).json({
                mensagem: "O horário final deve ser posterior ao inicial."
            });
        }

        const resultado = await pool.query(
            `UPDATE eventos_academicos
            SET
                titulo = $1,
                descricao = $2,
                data_inicio = $3,
                data_fim = $4,
                horario_inicio = $5,
                horario_fim = $6,
                categoria = $7,
                cor = $8,
                local = $9
            WHERE id = $10
            RETURNING *`,
            [
                titulo.trim(),
                descricao || null,
                data_inicio,
                data_fim || null,
                horario_inicio || null,
                horario_fim || null,
                categoria || "Acadêmico",
                cor || "#8B5CF6",
                local || null,
                id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Evento não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Evento atualizado com sucesso!",
            evento: resultado.rows[0]
        });

    } catch (erro) {
        console.error("Erro ao editar evento:", erro);

        return res.status(500).json({
            mensagem: "Erro ao editar evento.",
            detalhe: erro.message
        });
    }
});

// EXCLUIR EVENTO
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            `DELETE FROM eventos_academicos
            WHERE id = $1
            RETURNING *`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Evento não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Evento excluído com sucesso!"
        });

    } catch (erro) {
        console.error("Erro ao excluir evento:", erro);

        return res.status(500).json({
            mensagem: "Erro ao excluir evento.",
            detalhe: erro.message
        });
    }
});

module.exports = router;
