let produtos = [];
let nextId = 1;

const listar = (req, res) => {
    const listar = (req, res) => {
    res.status(200).json(produtos);
};
};

const buscarPorId = (req, res) => {
    const buscarPorId = (req, res) => {
    const id = parseInt(req.params.id, 10);
    const produto = produtos.find(p => p.id === id);

    if (!produto) {
        return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.status(200).json(produto);
};
};

const criar = (req, res) => {
    const criar = (req, res) => {
    const { nome, descricao, preco, categoria, estoque } = req.body;

    // Validação dos campos obrigatórios conforme exigido pelo roteiro
    if (!nome) return res.status(400).json({ erro: "O campo 'nome' é obrigatório", campo: "nome" });
    if (!descricao) return res.status(400).json({ erro: "O campo 'descricao' é obrigatório", campo: "descricao" });
    if (preco === undefined || preco === null) return res.status(400).json({ erro: "O campo 'preco' é obrigatório", campo: "preco" });
    if (!categoria) return res.status(400).json({ erro: "O campo 'categoria' é obrigatório", campo: "categoria" });
    if (estoque === undefined || estoque === null) return res.status(400).json({ erro: "O campo 'estoque' é obrigatório", campo: "estoque" });

    const dataAtual = new Date().toISOString();

    const novoProduto = {
        id: nextId++,
        nome,
        descricao,
        preco,
        categoria,
        estoque,
        ativo: true,
        criado_em: dataAtual,
        atualizado_em: dataAtual
    };

    produtos.push(novoProduto);

    // Retorna 201 Created com o objeto criado
    res.status(201).json(novoProduto);
};
};

const atualizar = (req, res) => {
    // TODO
};

const remover = (req, res) => {
    // TODO
};

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    remover
};