-- 1. TABELA DE USUÁRIOS
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) DEFAULT 'aluno'
        CHECK (tipo_usuario IN ('aluno', 'professor', 'admin')),
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE ATIVIDADES
CREATE TABLE atividades (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    data_atividade DATE NOT NULL,
    horario_inicio TIME,
    horario_fim TIME,
    categoria VARCHAR(50),
    prioridade VARCHAR(20) DEFAULT 'media'
        CHECK (prioridade IN ('baixa', 'media', 'alta')),
    status VARCHAR(30) DEFAULT 'pendente'
        CHECK (status IN ('pendente', 'em andamento', 'concluida')),
    local VARCHAR(150),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_atividade_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE,

    CONSTRAINT chk_horarios
    CHECK (
        horario_inicio IS NULL
        OR horario_fim IS NULL
        OR horario_fim > horario_inicio
    )
);

-- 3. TABELA DE EVENTOS ACADÊMICOS
CREATE TABLE eventos_academicos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    horario_inicio TIME,
    horario_fim TIME,
    categoria VARCHAR(50),
    cor VARCHAR(20),
    local VARCHAR(150),
    criado_por INTEGER,

    CONSTRAINT fk_evento_usuario
    FOREIGN KEY (criado_por)
    REFERENCES usuarios(id)
    ON DELETE SET NULL,

    CONSTRAINT chk_datas_evento
    CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);

-- 4. TABELA DE CONFIGURAÇÕES
CREATE TABLE configuracoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL UNIQUE,
    tema VARCHAR(20) DEFAULT 'claro',
    notificacoes BOOLEAN DEFAULT TRUE,
    notificacoes_email BOOLEAN DEFAULT FALSE,
    formato_horario VARCHAR(10) DEFAULT '24h',
    primeiro_dia_semana VARCHAR(10) DEFAULT 'segunda',

    CONSTRAINT fk_config_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- 5. TABELA DE RECUPERAÇÃO DE SENHA
CREATE TABLE recuperacao_senha (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    data_expiracao TIMESTAMP NOT NULL,
    utilizado BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recuperacao_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_atividades_usuario
ON atividades(usuario_id);

CREATE INDEX idx_atividades_data
ON atividades(data_atividade);

CREATE INDEX idx_atividades_status
ON atividades(status);

CREATE INDEX idx_eventos_data
ON eventos_academicos(data_inicio);

CREATE INDEX idx_recuperacao_token
ON recuperacao_senha(token);


INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES
('Karen Pereira', 'karen@email.com', '123456', 'aluno'),
('Mariana Oliveira', 'mariana@email.com', '123456', 'aluno'),
('Lucas Santos', 'lucas@email.com', '123456', 'aluno'),
('Professor Carlos', 'carlos@sesi.com', '123456', 'professor'),
('Administrador SESI', 'admin@sesi.com', '123456', 'admin');



INSERT INTO atividades
(usuario_id, titulo, descricao, data_atividade, horario_inicio, horario_fim, categoria, prioridade, status, local)
VALUES
(1, 'Entrega do projeto de programação', 'Finalizar e entregar o projeto de Desenvolvimento de Sistemas.', '2026-11-26', '08:00', '10:00', 'Escolar', 'alta', 'pendente', 'Laboratório de Informática'),

(1, 'Estudar Banco de Dados', 'Revisar comandos SQL, INSERT, UPDATE e DELETE.', '2026-11-27', '14:00', '15:30', 'Estudos', 'media', 'em andamento', 'Casa'),

(1, 'Apresentação do projeto', 'Apresentar o sistema Organiza SESI.', '2026-12-02', '09:00', '10:00', 'Escolar', 'alta', 'pendente', 'Sala de aula'),

(1, 'Revisar conteúdo de inglês', 'Estudar vocabulário e praticar conversação.', '2026-11-28', '16:00', '17:00', 'Pessoal', 'baixa', 'concluida', 'Casa'),

(2, 'Atividade de Matemática', 'Resolver lista de exercícios.', '2026-11-26', '10:00', '11:00', 'Escolar', 'media', 'pendente', 'Sala 03'),

(3, 'Trabalho de História', 'Finalizar pesquisa sobre história contemporânea.', '2026-11-29', '13:00', '15:00', 'Escolar', 'alta', 'em andamento', 'Biblioteca');



INSERT INTO eventos_academicos
(titulo, descricao, data_inicio, data_fim, horario_inicio, horario_fim, categoria, cor, local, criado_por)
VALUES
('Semana de Tecnologia', 'Apresentação de projetos tecnológicos dos alunos.', '2026-11-25', '2026-11-27', '08:00', '17:00', 'Evento', '#8B5CF6', 'SESI Vinhedo', 4),

('Reunião Pedagógica', 'Reunião de planejamento dos professores.', '2026-11-30', '2026-11-30', '13:00', '15:00', 'Reunião', '#60A5FA', 'Sala de reuniões', 5),

('Feira de Ciências', 'Exposição dos projetos científicos.', '2026-12-03', '2026-12-03', '09:00', '16:00', 'Acadêmico', '#34D399', 'Pátio SESI', 4),

('Encerramento do Semestre', 'Atividades de encerramento do semestre letivo.', '2026-12-10', '2026-12-10', '08:00', '12:00', 'Acadêmico', '#F59E0B', 'Auditório', 5),

('Conselho de Classe', 'Avaliação do desempenho das turmas.', '2026-12-07', '2026-12-07', '14:00', '16:00', 'Reunião', '#EC4899', 'SESI Vinhedo', 4);


INSERT INTO configuracoes
(usuario_id, tema, notificacoes, notificacoes_email, formato_horario, primeiro_dia_semana)
VALUES
(1, 'claro', TRUE, TRUE, '24h', 'segunda'),
(2, 'escuro', TRUE, FALSE, '24h', 'segunda'),
(3, 'claro', FALSE, FALSE, '12h', 'domingo'),
(4, 'claro', TRUE, TRUE, '24h', 'segunda'),
(5, 'escuro', TRUE, TRUE, '24h', 'segunda');



INSERT INTO recuperacao_senha
(usuario_id, token, data_expiracao, utilizado)
VALUES
(1, 'TOKEN-KAREN-001', '2026-11-25 23:59:00', FALSE),
(2, 'TOKEN-MARIANA-002', '2026-11-25 23:59:00', TRUE);