
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Atividades() {
    const navigate = useNavigate();

    const [atividades, setAtividades] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [filtro, setFiltro] = useState("Todas");
    const [modalAberto, setModalAberto] = useState(false);
    const [editando, setEditando] = useState(null);

    const [formulario, setFormulario] = useState({
        titulo: "",
        descricao: "",
        categoria: "Trabalho",
        prioridade: "Média",
        data_entrega: "",
        status: "Pendente"
    });

    async function carregarAtividades() {
        try {
            setErro("");

            const resposta = await api.get("/atividades");

            const dados = Array.isArray(resposta.data)
                ? resposta.data
                : resposta.data.atividades || [];

            setAtividades(dados);
        } catch (error) {
            console.error(error);
            setErro("Não foi possível carregar as atividades.");
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarAtividades();
    }, []);

    function abrirCadastro() {
        setEditando(null);

        setFormulario({
            titulo: "",
            descricao: "",
            categoria: "Trabalho",
            prioridade: "Média",
            data_entrega: "",
            status: "Pendente"
        });

        setModalAberto(true);
    }

    function abrirEdicao(atividade) {
        setEditando(atividade.id);

        setFormulario({
            titulo: atividade.titulo || "",
            descricao: atividade.descricao || "",
            categoria: atividade.categoria || "Trabalho",
            prioridade: atividade.prioridade || "Média",
            data_entrega: atividade.data_entrega
                ? String(atividade.data_entrega).slice(0, 10)
                : "",
            status: atividade.status || "Pendente"
        });

        setModalAberto(true);
    }

    async function salvarAtividade(e) {
        e.preventDefault();

        try {
            if (editando) {
                await api.put(`/atividades/${editando}`, formulario);
            } else {
                await api.post("/atividades", formulario);
            }

            setModalAberto(false);
            await carregarAtividades();
        } catch (error) {
            console.error(error);
            alert(
                error.response?.data?.mensagem ||
                "Não foi possível salvar a atividade."
            );
        }
    }

    async function excluirAtividade(id) {
        const confirmar = window.confirm(
            "Deseja realmente excluir esta atividade?"
        );

        if (!confirmar) return;

        try {
            await api.delete(`/atividades/${id}`);
            await carregarAtividades();
        } catch (error) {
            console.error(error);
            alert("Não foi possível excluir a atividade.");
        }
    }

    const atividadesFiltradas = atividades.filter((atividade) => {
        if (filtro === "Todas") return true;

        return atividade.status?.toLowerCase() === filtro.toLowerCase();
    });

    const quantidadeConcluidas = atividades.filter(
        (atividade) => atividade.status?.toLowerCase() === "concluída"
            || atividade.status?.toLowerCase() === "concluida"
    ).length;

    return (
        <main className="atividades-page">

            <header className="atividades-header">
                <div>
                    <Link to="/dashboard" className="voltar-dashboard">
                        ← Voltar ao painel
                    </Link>

                    <span className="atividades-overline">
                        ORGANIZAÇÃO ACADÊMICA
                    </span>

                    <h1>Minhas atividades</h1>

                    <p>
                        Organize seus trabalhos, tarefas e entregas escolares.
                    </p>
                </div>

                <button
                    className="nova-atividade-btn"
                    onClick={abrirCadastro}
                >
                    + Nova atividade
                </button>
            </header>

            <section className="atividades-resumo">

                <article className="resumo-card">
                    <span>Total de atividades</span>
                    <strong>{atividades.length}</strong>
                </article>

                <article className="resumo-card">
                    <span>Pendentes</span>
                    <strong>
                        {atividades.filter(
                            (a) => a.status?.toLowerCase() === "pendente"
                        ).length}
                    </strong>
                </article>

                <article className="resumo-card">
                    <span>Em andamento</span>
                    <strong>
                        {atividades.filter(
                            (a) => a.status?.toLowerCase() === "em andamento"
                        ).length}
                    </strong>
                </article>

                <article className="resumo-card">
                    <span>Concluídas</span>
                    <strong>{quantidadeConcluidas}</strong>
                </article>

            </section>

            <section className="atividades-lista-container">

                <div className="atividades-lista-header">
                    <div>
                        <h2>Lista de atividades</h2>
                        <p>Acompanhe tudo o que precisa fazer.</p>
                    </div>

                    <select
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    >
                        <option value="Todas">Todas</option>
                        <option value="Pendente">Pendentes</option>
                        <option value="Em andamento">Em andamento</option>
                        <option value="Concluída">Concluídas</option>
                    </select>
                </div>

                {carregando ? (
                    <p className="atividades-mensagem">
                        Carregando atividades...
                    </p>
                ) : erro ? (
                    <p className="atividades-erro">{erro}</p>
                ) : atividadesFiltradas.length === 0 ? (
                    <div className="atividades-vazio">
                        <span>✦</span>
                        <h3>Nenhuma atividade encontrada</h3>
                        <p>
                            Adicione sua primeira atividade para começar
                            a organizar seus estudos.
                        </p>

                        <button onClick={abrirCadastro}>
                            Criar atividade
                        </button>
                    </div>
                ) : (
                    <div className="atividades-lista">
                        {atividadesFiltradas.map((atividade) => (
                            <article
                                className="atividade-item"
                                key={atividade.id}
                            >
                                <div className="atividade-item-info">
                                    <span className="atividade-categoria">
                                        {atividade.categoria || "Atividade"}
                                    </span>

                                    <h3>{atividade.titulo}</h3>

                                    <p>{atividade.descricao}</p>

                                    <span className="atividade-data">
                                        Entrega: {atividade.data_entrega
                                            ? new Date(
                                                String(atividade.data_entrega).slice(0, 10) + "T12:00:00"
                                            ).toLocaleDateString("pt-BR")
                                            : "Não definida"}
                                    </span>
                                </div>

                                <div className="atividade-acoes">
                                    <span className={`atividade-status ${
                                        atividade.status?.toLowerCase().replace(" ", "-")
                                    }`}>
                                        {atividade.status || "Pendente"}
                                    </span>

                                    <button
                                        onClick={() => abrirEdicao(atividade)}
                                    >
                                        Editar
                                    </button>

                                    <button
                                        className="excluir-atividade"
                                        onClick={() => excluirAtividade(atividade.id)}
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

            </section>

            {modalAberto && (
                <div className="atividade-modal-fundo">
                    <form
                        className="atividade-modal"
                        onSubmit={salvarAtividade}
                    >
                        <div className="atividade-modal-header">
                            <div>
                                <span>ENTREGAJÁ</span>
                                <h2>
                                    {editando
                                        ? "Editar atividade"
                                        : "Nova atividade"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setModalAberto(false)}
                            >
                                ×
                            </button>
                        </div>

                        <label>Título</label>
                        <input
                            type="text"
                            value={formulario.titulo}
                            onChange={(e) => setFormulario({
                                ...formulario,
                                titulo: e.target.value
                            })}
                            placeholder="Ex.: Trabalho de matemática"
                            required
                        />

                        <label>Descrição</label>
                        <textarea
                            value={formulario.descricao}
                            onChange={(e) => setFormulario({
                                ...formulario,
                                descricao: e.target.value
                            })}
                            placeholder="Descreva sua atividade..."
                        />

                        <div className="atividade-form-grid">
                            <div>
                                <label>Categoria</label>
                                <select
                                    value={formulario.categoria}
                                    onChange={(e) => setFormulario({
                                        ...formulario,
                                        categoria: e.target.value
                                    })}
                                >
                                    <option>Trabalho</option>
                                    <option>Tarefa</option>
                                    <option>Pesquisa</option>
                                    <option>Estudo</option>
                                </select>
                            </div>

                            <div>
                                <label>Prioridade</label>
                                <select
                                    value={formulario.prioridade}
                                    onChange={(e) => setFormulario({
                                        ...formulario,
                                        prioridade: e.target.value
                                    })}
                                >
                                    <option>Baixa</option>
                                    <option>Média</option>
                                    <option>Alta</option>
                                </select>
                            </div>
                        </div>

                        <label>Data de entrega</label>
                        <input
                            type="date"
                            value={formulario.data_entrega}
                            onChange={(e) => setFormulario({
                                ...formulario,
                                data_entrega: e.target.value
                            })}
                        />

                        <label>Status</label>
                        <select
                            value={formulario.status}
                            onChange={(e) => setFormulario({
                                ...formulario,
                                status: e.target.value
                            })}
                        >
                            <option>Pendente</option>
                            <option>Em andamento</option>
                            <option>Concluída</option>
                        </select>

                        <div className="atividade-modal-acoes">
                            <button
                                type="button"
                                className="cancelar-btn"
                                onClick={() => setModalAberto(false)}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="salvar-atividade-btn"
                            >
                                Salvar atividade
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </main>
    );
}
