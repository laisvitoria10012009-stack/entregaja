
const express = require("express");
const pool = require("../db");
const { verificarAutenticacao } = require("../middleware/auth");

const router = express.Router();

router.use(verificarAutenticacao);

// LISTAR ATIVIDADES
router.get("/", async (req, res) => {
    try {
        const usuarioId = req.session.usuario.id;

        const resultado = await pool.query(
            `SELECT *
             FROM atividades
             WHERE usuario_id = $1
             ORDER BY data_atividade ASC, horario_inicio ASC`,
            [usuarioId]
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao buscar atividades."
        });
    }
});

// CADASTRAR ATIVIDADE
router.post("/", async (req, res) => {
    try {
        const {
            titulo,
            descricao,
            data_atividade,
            horario_inicio,
            horario_fim,
            categoria,
            prioridade,
            status,
            local
        } = req.body;

        if (!titulo || !data_atividade) {
            return res.status(400).json({
                mensagem: "Título e data são obrigatórios."
            });
        }

        const resultado = await pool.query(
            `INSERT INTO atividades
            (usuario_id, titulo, descricao, data_atividade,
             horario_inicio, horario_fim, categoria, prioridade,
             status, local)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
             RETURNING *`,
            [
                req.session.usuario.id,
                titulo,
                descricao || null,
                data_atividade,
                horario_inicio || null,
                horario_fim || null,
                categoria || null,
                prioridade || "media",
                status || "pendente",
                local || null
            ]
        );

        res.status(201).json({
            mensagem: "Atividade cadastrada com sucesso!",
            atividade: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao cadastrar atividade."
        });
    }
});

// EDITAR ATIVIDADE
router.put("/:id", async (req, res) => {
    try {
        const {
            titulo,
            descricao,
            data_atividade,
            horario_inicio,
            horario_fim,
            categoria,
            prioridade,
            status,
            local
        } = req.body;

        const resultado = await pool.query(
            `UPDATE atividades
             SET titulo = $1,
                 descricao = $2,
                 data_atividade = $3,
                 horario_inicio = $4,
                 horario_fim = $5,
                 categoria = $6,
                 prioridade = $7,
                 status = $8,
                 local = $9
             WHERE id = $10 AND usuario_id = $11
             RETURNING *`,
            [
                titulo,
                descricao || null,
                data_atividade,
                horario_inicio || null,
                horario_fim || null,
                categoria || null,
                prioridade,
                status,
                local || null,
                req.params.id,
                req.session.usuario.id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Atividade não encontrada."
            });
        }

        res.json({
            mensagem: "Atividade atualizada com sucesso!",
            atividade: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao atualizar atividade."
        });
    }
});

// ATUALIZAR STATUS
router.patch("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;

        const statusPermitidos = [
            "pendente",
            "em andamento",
            "concluida"
        ];

        if (!statusPermitidos.includes(status)) {
            return res.status(400).json({
                mensagem: "Status inválido."
            });
        }

        const resultado = await pool.query(
            `UPDATE atividades
             SET status = $1
             WHERE id = $2 AND usuario_id = $3
             RETURNING *`,
            [
                status,
                req.params.id,
                req.session.usuario.id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Atividade não encontrada."
            });
        }

        res.json({
            mensagem: "Status atualizado!",
            atividade: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao atualizar status."
        });
    }
});

// EXCLUIR ATIVIDADE
router.delete("/:id", async (req, res) => {
    try {
        const resultado = await pool.query(
            `DELETE FROM atividades
             WHERE id = $1 AND usuario_id = $2
             RETURNING id`,
            [req.params.id, req.session.usuario.id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: "Atividade não encontrada."
            });
        }

        res.json({
            mensagem: "Atividade excluída com sucesso!"
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao excluir atividade."
        });
    }
});

module.exports = router;
