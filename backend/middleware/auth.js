
function verificarAutenticacao(req, res, next) {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({
            mensagem: "Você precisa estar autenticado para acessar esta página."
        });
    }

    next();
}

function verificarProfessor(req, res, next) {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({
            mensagem: "Você precisa fazer login."
        });
    }

    if (
        req.session.usuario.tipo_usuario !== "professor" &&
        req.session.usuario.tipo_usuario !== "admin"
    ) {
        return res.status(403).json({
            mensagem: "Acesso permitido somente para professores e administradores."
        });
    }

    next();
}

function verificarAdmin(req, res, next) {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({
            mensagem: "Você precisa fazer login."
        });
    }

    if (req.session.usuario.tipo_usuario !== "admin") {
        return res.status(403).json({
            mensagem: "Acesso permitido somente para administradores."
        });
    }

    next();
}

module.exports = {
    verificarAutenticacao,
    verificarProfessor,
    verificarAdmin
};
