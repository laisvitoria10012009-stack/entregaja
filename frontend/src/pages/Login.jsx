
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function fazerLogin(e) {
        e.preventDefault();
        setErro("");
        setCarregando(true);

        try {
            await api.post("/auth/login", { email, senha });
            navigate("/dashboard");
        } catch (error) {
            setErro(
                error.response?.data?.mensagem ||
                "Não foi possível entrar. Confira seu e-mail e senha."
            );
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className="login-page">
            <section className="login-apresentacao">
                <div className="login-logo">
                    <span className="login-logo-icon">EJ</span>
                    <span>EntregaJá</span>
                </div>

                <div className="login-chamada">
                    <span className="login-tag">ORGANIZAÇÃO ACADÊMICA</span>
                    <h1>Organize seus estudos. Conquiste seus objetivos.</h1>
                    <p>
                        Um espaço feito para acompanhar suas atividades,
                        provas e compromissos escolares sem perder nenhum prazo.
                    </p>

                    <div className="login-destaque">
                        <span>✓</span>
                        <div>
                            <strong>Tudo em um só lugar</strong>
                            <p>Mais organização para sua rotina.</p>
                        </div>
                    </div>
                </div>

                <span className="login-rodape">
                    Sua rotina acadêmica mais organizada.
                </span>
            </section>

            <section className="login-lateral">
                <form className="login-card" onSubmit={fazerLogin}>
                    <div className="login-card-icon">✦</div>

                    <span className="login-subtitulo">BEM-VINDO DE VOLTA</span>
                    <h2>Faça seu login</h2>
                    <p className="login-descricao">
                        Entre na sua conta para continuar.
                    </p>

                    {erro && <div className="login-erro">{erro}</div>}

                    <label htmlFor="email">E-mail</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Digite seu e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label htmlFor="senha">Senha</label>
                    <input
                        id="senha"
                        type="password"
                        placeholder="Digite sua senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />

                    <button type="submit" disabled={carregando}>
                        {carregando ? "Entrando..." : "Entrar na plataforma"}
                    </button>

                    <p className="login-cadastro">
                        Ainda não possui uma conta?
                        <Link to="/register"> Criar conta</Link>
                    </p>
                </form>
            </section>
        </main>
    );
}

export default Login;
