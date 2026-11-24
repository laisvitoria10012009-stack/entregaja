
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function fazerCadastro(e) {
        e.preventDefault();
        setErro("");

        if (senha !== confirmarSenha) {
            setErro("As senhas não coincidem.");
            return;
        }

        if (senha.length < 6) {
            setErro("A senha precisa ter pelo menos 6 caracteres.");
            return;
        }

        setCarregando(true);

        try {
            await api.post("/auth/cadastro", {
                nome,
                email,
                senha
            });

            navigate("/dashboard");
        } catch (error) {
            setErro(
                error.response?.data?.mensagem ||
                "Não foi possível realizar o cadastro."
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
                    <span className="login-tag">
                        ORGANIZAÇÃO ACADÊMICA
                    </span>

                    <h1>Comece a organizar sua vida escolar!</h1>

                    <p>
                        Crie sua conta e tenha suas atividades,
                        avaliações e compromissos organizados
                        em um só lugar.
                    </p>

                    <div className="login-destaque">
                        <span>✓</span>
                        <div>
                            <strong>Sua rotina mais organizada</strong>
                            <p>Não perca nenhum prazo importante.</p>
                        </div>
                    </div>
                </div>

                <span className="login-rodape">
                    EntregaJá · Organização acadêmica
                </span>
            </section>

            <section className="login-lateral">
                <form className="login-card cadastro-card" onSubmit={fazerCadastro}>
                    <div className="login-card-icon">✦</div>

                    <span className="login-subtitulo">
                        CRIE SUA CONTA
                    </span>

                    <h2>Cadastre-se</h2>

                    <p className="login-descricao">
                        Preencha os dados para começar.
                    </p>

                    {erro && (
                        <div className="login-erro">
                            {erro}
                        </div>
                    )}

                    <label htmlFor="nome">Nome completo</label>
                    <input
                        id="nome"
                        type="text"
                        placeholder="Digite seu nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />

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
                        placeholder="Crie uma senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        minLength={6}
                        required
                    />

                    <label htmlFor="confirmarSenha">
                        Confirmar senha
                    </label>
                    <input
                        id="confirmarSenha"
                        type="password"
                        placeholder="Digite a senha novamente"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        required
                    />

                    <button type="submit" disabled={carregando}>
                        {carregando ? "Criando conta..." : "Criar minha conta"}
                    </button>

                    <p className="login-cadastro">
                        Já possui uma conta?
                        <Link to="/login"> Fazer login</Link>
                    </p>
                </form>
            </section>
        </main>
    );
}

export default Register;
