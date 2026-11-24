
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function buscarUsuario() {
            try {
                const resposta = await api.get("/auth/me");

                setUsuario(
                    resposta.data.usuario || resposta.data
                );
            } catch (erro) {
                navigate("/login");
            } finally {
                setCarregando(false);
            }
        }

        buscarUsuario();
    }, [navigate]);

    async function sair() {
        try {
            await api.post("/auth/logout");
            navigate("/login");
        } catch {
            alert("Não foi possível sair da conta.");
        }
    }

    if (carregando) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Carregando seu painel...</p>
            </div>
        );
    }

    return (
        <main className="dashboard-page">

            <aside className="dashboard-sidebar">

                <Link to="/dashboard" className="dashboard-logo">
                    <span className="dashboard-logo-icon">EJ</span>
                    <span>EntregaJá</span>
                </Link>

                <div className="sidebar-section">
                    <span className="sidebar-title">MENU PRINCIPAL</span>

                    <Link to="/dashboard" className="sidebar-link active">
                        <span>⌂</span>
                        Visão geral
                    </Link>

                    <Link to="/atividades" className="sidebar-link">
                        <span>▤</span>
                        Atividades
                    </Link>

                    <Link to="/eventos" className="sidebar-link">
                        <span>◷</span>
                        Eventos
                    </Link>
                </div>

                <div className="sidebar-bottom">

                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {usuario?.nome?.charAt(0).toUpperCase() || "U"}
                        </div>

                        <div className="sidebar-user-info">
                            <strong>{usuario?.nome || "Usuário"}</strong>
                            <span>Minha conta</span>
                        </div>
                    </div>

                    <button
                        className="sidebar-logout"
                        onClick={sair}
                    >
                        <span>↪</span>
                        Sair da conta
                    </button>

                </div>
            </aside>

            <section className="dashboard-main">

                <header className="dashboard-topbar">

                    <div>
                        <span className="topbar-label">ÁREA DO ESTUDANTE</span>
                        <h2>Meu painel</h2>
                    </div>

                    <div className="topbar-profile">
                        <div className="topbar-avatar">
                            {usuario?.nome?.charAt(0).toUpperCase() || "U"}
                        </div>

                        <span>{usuario?.nome || "Estudante"}</span>
                    </div>

                </header>

                <div className="dashboard-content" id="inicio">

                    <section className="welcome-banner">

                        <div className="welcome-text">
                            <span>SEJA BEM-VINDO(A) AO ENTREGAJÁ</span>

                            <h1>
                                Olá, {usuario?.nome?.split(" ")[0] || "estudante"}!
                            </h1>

                            <p>
                                Organize seus estudos, acompanhe seus
                                compromissos e mantenha tudo em dia.
                            </p>
                        </div>

                        <div className="welcome-decoration">
                            <div className="decoration-circle">
                                ✦
                            </div>
                        </div>

                    </section>

                    <div className="section-heading">
                        <div>
                            <span className="section-overline">
                                ORGANIZAÇÃO
                            </span>

                            <h2>Seu espaço acadêmico</h2>

                            <p>
                                Acesse as principais áreas da sua rotina escolar.
                            </p>
                        </div>
                    </div>

                    <section className="dashboard-cards">

                        <Link to="/atividades" className="dashboard-card">

                            <div className="dashboard-card-icon purple">
                                ▤
                            </div>

                            <span className="card-category">
                                ORGANIZAÇÃO
                            </span>

                            <h3>Minhas atividades</h3>

                            <p>
                                Organize trabalhos, tarefas e entregas
                                escolares.
                            </p>

                            <span className="card-footer">
                                Área de atividades <span>→</span>
                            </span>

                        </Link>

                        <Link to="/eventos" className="dashboard-card">

                            <div className="dashboard-card-icon blue">
                                ◷
                            </div>

                            <span className="card-category">
                                COMPROMISSOS
                            </span>

                            <h3>Eventos acadêmicos</h3>

                            <p>
                                Consulte eventos e compromissos
                                da sua instituição.
                            </p>

                            <span className="card-footer">
                                Área de eventos <span>→</span>
                            </span>

                        </Link>

                    </section>

                    <section className="dashboard-bottom">

                        <div className="dashboard-message-icon">
                            ✨
                        </div>

                        <div>
                            <h3>Um passo de cada vez!</h3>

                            <p>
                                Mantenha suas atividades organizadas
                                e acompanhe seus compromissos.
                            </p>
                        </div>

                    </section>

                    <footer className="dashboard-footer">
                        EntregaJá © 2026 · Organização acadêmica
                    </footer>

                </div>
            </section>
        </main>
    );
}
