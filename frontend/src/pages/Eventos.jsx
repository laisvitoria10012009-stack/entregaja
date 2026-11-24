
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/global.css";

const novoEvento = {
    titulo: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
    horario_inicio: "",
    horario_fim: "",
    categoria: "Acadêmico",
    cor: "#8B5CF6",
    local: ""
};

const formatarData = (data) => {
    if (!data) return "";
    return String(data).slice(0, 10);
};

const mensagemErro = (erro, padrao) => {
    return (
        erro.response?.data?.mensagem ||
        erro.response?.data?.detalhe ||
        erro.message ||
        padrao
    );
};

export default function Eventos() {
    const [eventos, setEventos] = useState([]);
    const [mesAtual, setMesAtual] = useState(new Date());
    const [modalAberto, setModalAberto] = useState(false);
    const [eventoSelecionado, setEventoSelecionado] = useState(null);
    const [formulario, setFormulario] = useState(novoEvento);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();

    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const deslocamento = (primeiroDia + 6) % 7;

    const nomeMes = mesAtual.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
    });

    const carregarEventos = async () => {
        try {
            setCarregando(true);

            const resposta = await api.get("/eventos");

            if (!Array.isArray(resposta.data)) {
                throw new Error("O servidor retornou uma resposta inesperada.");
            }

            setEventos(resposta.data);
            setErro("");
        } catch (erro) {
            console.error(
                "Erro ao carregar eventos:",
                erro.response?.data || erro
            );

            setErro(mensagemErro(
                erro,
                "Não foi possível carregar os eventos."
            ));
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarEventos();
    }, []);

    const dias = useMemo(() => {
        return [
            ...Array(deslocamento).fill(null),
            ...Array.from({ length: diasNoMes }, (_, i) => i + 1)
        ];
    }, [deslocamento, diasNoMes]);

    const dataDoDia = (dia) => {
        return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    };

    const eventosDoDia = (dia) => {
        const data = dataDoDia(dia);

        return eventos.filter((evento) => {
            const inicio = formatarData(evento.data_inicio);
            const fim = formatarData(evento.data_fim || evento.data_inicio);

            return data >= inicio && data <= fim;
        });
    };

    const abrirNovoEvento = (dia = null) => {
        setEventoSelecionado(null);

        const hoje = new Date();
        const dataHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

        setFormulario({
            ...novoEvento,
            data_inicio: dia ? dataDoDia(dia) : dataHoje
        });

        setErro("");
        setModalAberto(true);
    };

    const abrirEdicao = (evento) => {
        setEventoSelecionado(evento);

        setFormulario({
            titulo: evento.titulo || "",
            descricao: evento.descricao || "",
            data_inicio: formatarData(evento.data_inicio),
            data_fim: formatarData(evento.data_fim),
            horario_inicio: evento.horario_inicio?.slice(0, 5) || "",
            horario_fim: evento.horario_fim?.slice(0, 5) || "",
            categoria: evento.categoria || "Acadêmico",
            cor: evento.cor || "#8B5CF6",
            local: evento.local || ""
        });

        setErro("");
        setModalAberto(true);
    };

    const atualizarCampo = (campo, valor) => {
        setFormulario((atual) => ({
            ...atual,
            [campo]: valor
        }));
    };

    const salvarEvento = async (e) => {
        e.preventDefault();
        setErro("");

        if (!formulario.titulo.trim() || !formulario.data_inicio) {
            setErro("Preencha o título e a data inicial.");
            return;
        }

        if (
            formulario.data_fim &&
            formulario.data_fim < formulario.data_inicio
        ) {
            setErro("A data final não pode ser anterior à data inicial.");
            return;
        }

        if (
            formulario.horario_inicio &&
            formulario.horario_fim &&
            formulario.horario_fim <= formulario.horario_inicio
        ) {
            setErro("O horário final deve ser posterior ao inicial.");
            return;
        }

        const dados = {
            titulo: formulario.titulo.trim(),
            descricao: formulario.descricao,
            data_inicio: formulario.data_inicio,
            data_fim: formulario.data_fim || null,
            horario_inicio: formulario.horario_inicio || null,
            horario_fim: formulario.horario_fim || null,
            categoria: formulario.categoria,
            cor: formulario.cor,
            local: formulario.local
        };

        try {
            setSalvando(true);

            if (eventoSelecionado) {
                await api.put(
                    `/eventos/${eventoSelecionado.id}`,
                    dados
                );
            } else {
                await api.post("/eventos", dados);
            }

            await carregarEventos();

            setModalAberto(false);
            setFormulario(novoEvento);
            setEventoSelecionado(null);
            setErro("");

        } catch (erro) {
            console.error(
                "Erro ao salvar evento:",
                erro.response?.data || erro
            );

            setErro(mensagemErro(
                erro,
                "Não foi possível salvar o evento."
            ));
        } finally {
            setSalvando(false);
        }
    };

    const excluirEvento = async (evento) => {
        const confirmar = window.confirm(
            `Deseja realmente excluir "${evento.titulo}"?`
        );

        if (!confirmar) return;

        try {
            await api.delete(`/eventos/${evento.id}`);

            await carregarEventos();

            setErro("");
        } catch (erro) {
            console.error(
                "Erro ao excluir evento:",
                erro.response?.data || erro
            );

            setErro(mensagemErro(
                erro,
                "Não foi possível excluir o evento."
            ));
        }
    };

    const mudarMes = (quantidade) => {
        setMesAtual(new Date(ano, mes + quantidade, 1));
    };

    const hoje = new Date();
    const dataHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

    return (
        <main className="eventos-page">
            <div className="eventos-topo">
                <div>
                    <span className="eventos-etiqueta">
                        ORGANIZAÇÃO ESCOLAR
                    </span>

                    <h1>Calendário de Eventos</h1>

                    <p>
                        Organize e acompanhe os eventos acadêmicos.
                    </p>
                </div>

                <div className="eventos-botoes-topo">
                    <Link
                        to="/dashboard"
                        className="evento-botao-cancelar"
                    >
                        ← Voltar ao painel
                    </Link>

                    <button
                        className="evento-botao-principal"
                        onClick={() => abrirNovoEvento()}
                    >
                        + Novo evento
                    </button>
                </div>
            </div>

            {erro && !modalAberto && (
                <div className="evento-alerta">{erro}</div>
            )}

            <section className="eventos-layout">
                <div className="calendario-card">
                    <div className="calendario-topo">
                        <div>
                            <h2>{nomeMes}</h2>
                            <span>Visualização mensal</span>
                        </div>

                        <div className="calendario-navegacao">
                            <button
                                onClick={() => mudarMes(-1)}
                                aria-label="Mês anterior"
                            >
                                ‹
                            </button>

                            <button onClick={() => setMesAtual(new Date())}>
                                Hoje
                            </button>

                            <button
                                onClick={() => mudarMes(1)}
                                aria-label="Próximo mês"
                            >
                                ›
                            </button>
                        </div>
                    </div>

                    <div className="calendario-grade">
                        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((dia) => (
                            <div className="calendario-semana" key={dia}>
                                {dia}
                            </div>
                        ))}

                        {dias.map((dia, indice) => {
                            const lista = dia ? eventosDoDia(dia) : [];
                            const ehHoje = dia && dataDoDia(dia) === dataHoje;

                            return (
                                <div
                                    className={`calendario-dia ${!dia ? "vazio" : ""} ${ehHoje ? "dia-hoje" : ""}`}
                                    key={`${ano}-${mes}-${indice}`}
                                >
                                    {dia && (
                                        <>
                                            <button
                                                className="dia-numero"
                                                onClick={() => abrirNovoEvento(dia)}
                                                title="Adicionar evento neste dia"
                                            >
                                                {dia}
                                            </button>

                                            <div className="dia-eventos">
                                                {lista.slice(0, 2).map((evento) => (
                                                    <button
                                                        key={evento.id}
                                                        className="evento-miniatura"
                                                        style={{
                                                            borderLeftColor: evento.cor || "#8B5CF6"
                                                        }}
                                                        onClick={() => abrirEdicao(evento)}
                                                        title={evento.titulo}
                                                    >
                                                        {evento.titulo}
                                                    </button>
                                                ))}

                                                {lista.length > 2 && (
                                                    <span className="mais-eventos">
                                                        +{lista.length - 2} eventos
                                                    </span>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <aside className="eventos-lateral">
                    <div className="eventos-lateral-topo">
                        <div>
                            <h2>Eventos cadastrados</h2>
                            <span>{eventos.length} evento(s)</span>
                        </div>

                        <span className="eventos-icone">✦</span>
                    </div>

                    {carregando ? (
                        <p className="eventos-vazio">
                            Carregando eventos...
                        </p>
                    ) : eventos.length === 0 ? (
                        <p className="eventos-vazio">
                            Nenhum evento cadastrado.
                        </p>
                    ) : (
                        <div className="eventos-lista">
                            {eventos.map((evento) => (
                                <article className="evento-item" key={evento.id}>
                                    <div
                                        className="evento-item-cor"
                                        style={{
                                            background: evento.cor || "#8B5CF6"
                                        }}
                                    />

                                    <div className="evento-item-conteudo">
                                        <strong>{evento.titulo}</strong>

                                        <span>
                                            {formatarData(evento.data_inicio)
                                                .split("-")
                                                .reverse()
                                                .join("/")}
                                        </span>

                                        {evento.local && (
                                            <small>{evento.local}</small>
                                        )}
                                    </div>

                                    <div className="evento-acoes">
                                        <button
                                            onClick={() => abrirEdicao(evento)}
                                            title="Editar evento"
                                            aria-label="Editar evento"
                                        >
                                            ✎
                                        </button>

                                        <button
                                            onClick={() => excluirEvento(evento)}
                                            title="Excluir evento"
                                            aria-label="Excluir evento"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </aside>
            </section>

            {modalAberto && (
                <div
                    className="evento-modal-fundo"
                    onClick={() => !salvando && setModalAberto(false)}
                >
                    <section
                        className="evento-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="evento-modal-topo">
                            <div>
                                <span>CALENDÁRIO ACADÊMICO</span>

                                <h2>
                                    {eventoSelecionado
                                        ? "Editar evento"
                                        : "Novo evento"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setModalAberto(false)}
                                aria-label="Fechar"
                                disabled={salvando}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={salvarEvento}>
                            <label>
                                Título *
                                <input
                                    value={formulario.titulo}
                                    onChange={(e) =>
                                        atualizarCampo("titulo", e.target.value)
                                    }
                                    placeholder="Nome do evento"
                                    maxLength={150}
                                    required
                                />
                            </label>

                            <label>
                                Descrição
                                <textarea
                                    value={formulario.descricao}
                                    onChange={(e) =>
                                        atualizarCampo("descricao", e.target.value)
                                    }
                                    placeholder="Descreva o evento..."
                                    rows="3"
                                />
                            </label>

                            <div className="evento-form-linha">
                                <label>
                                    Data inicial *
                                    <input
                                        type="date"
                                        value={formulario.data_inicio}
                                        onChange={(e) =>
                                            atualizarCampo("data_inicio", e.target.value)
                                        }
                                        required
                                    />
                                </label>

                                <label>
                                    Data final
                                    <input
                                        type="date"
                                        value={formulario.data_fim}
                                        min={formulario.data_inicio}
                                        onChange={(e) =>
                                            atualizarCampo("data_fim", e.target.value)
                                        }
                                    />
                                </label>
                            </div>

                            <div className="evento-form-linha">
                                <label>
                                    Horário inicial
                                    <input
                                        type="time"
                                        value={formulario.horario_inicio}
                                        onChange={(e) =>
                                            atualizarCampo("horario_inicio", e.target.value)
                                        }
                                    />
                                </label>

                                <label>
                                    Horário final
                                    <input
                                        type="time"
                                        value={formulario.horario_fim}
                                        onChange={(e) =>
                                            atualizarCampo("horario_fim", e.target.value)
                                        }
                                    />
                                </label>
                            </div>

                            <div className="evento-form-linha">
                                <label>
                                    Categoria
                                    <select
                                        value={formulario.categoria}
                                        onChange={(e) =>
                                            atualizarCampo("categoria", e.target.value)
                                        }
                                    >
                                        <option>Acadêmico</option>
                                        <option>Evento</option>
                                        <option>Reunião</option>
                                        <option>Projeto</option>
                                        <option>Outro</option>
                                    </select>
                                </label>

                                <label>
                                    Cor do evento
                                    <input
                                        type="color"
                                        value={formulario.cor}
                                        onChange={(e) =>
                                            atualizarCampo("cor", e.target.value)
                                        }
                                    />
                                </label>
                            </div>

                            <label>
                                Local
                                <input
                                    value={formulario.local}
                                    onChange={(e) =>
                                        atualizarCampo("local", e.target.value)
                                    }
                                    placeholder="Local do evento"
                                    maxLength={150}
                                />
                            </label>

                            {erro && (
                                <div className="evento-alerta">
                                    {erro}
                                </div>
                            )}

                            <div className="evento-modal-acoes">
                                <button
                                    type="button"
                                    className="evento-botao-cancelar"
                                    onClick={() => setModalAberto(false)}
                                    disabled={salvando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="evento-botao-principal"
                                    disabled={salvando}
                                >
                                    {salvando
                                        ? "Salvando..."
                                        : eventoSelecionado
                                            ? "Salvar alterações"
                                            : "Adicionar evento"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}
