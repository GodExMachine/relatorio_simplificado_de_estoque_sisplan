const fs = require("fs");
const path = require("path");

const pastaDados = path.join(__dirname, "..", "dados");

const arquivoCodigos = path.join(pastaDados, "codigos.json");
const arquivoEstoque = path.join(pastaDados, "estoque.json");

if (!fs.existsSync(arquivoCodigos) || !fs.existsSync(arquivoEstoque)) {
    console.log("Aviso: codigos.json ou estoque.json nao encontrado. Consolidado nao gerado.");
    process.exit(0);
}

const codigos = JSON.parse(fs.readFileSync(arquivoCodigos, "utf8"));
const estoque = JSON.parse(fs.readFileSync(arquivoEstoque, "utf8"));


const estoqueMap = new Map();

for (const item of estoque) {
    estoqueMap.set(item.codigo, item);
}


const agrupados = new Map();

for (const item of codigos) {

    if (!agrupados.has(item.codigo)) {
        agrupados.set(item.codigo, {
            codigo: item.codigo,
            descricao: item.descricao,

            tecidoCima: "",
            malhaCima: "",

            tecidoBaixo: "",
            malhaBaixo: ""
        });
    }

    const grupo = agrupados.get(item.codigo);

   
    if (!grupo.descricao && item.descricao) {
        grupo.descricao = item.descricao;
    }

    switch (item.linha) {

        case "CIMA":
            grupo.tecidoCima = item.tecido || "";
            grupo.malhaCima = item.malha || "";
            break;

        case "BAIXO":
            grupo.tecidoBaixo = item.tecido || "";
            grupo.malhaBaixo = item.malha || "";
            break;

        case "AVULSO":
           
            grupo.tecidoCima = item.tecido || "";
            grupo.malhaCima = item.malha || "";

            grupo.tecidoBaixo = item.tecido || "";
            grupo.malhaBaixo = item.malha || "";
            break;
    }
}


const consolidado = [];

for (const grupo of agrupados.values()) {

    const est = estoqueMap.get(grupo.codigo);

    const P = Number(est?.P || 0);
    const M = Number(est?.M || 0);
    const G = Number(est?.G || 0);
    const GG = Number(est?.GG || 0);
    const EX = Number(est?.EX || 0);

    consolidado.push({
        codigo: grupo.codigo,
        descricao: grupo.descricao,

        tecidoCima: grupo.tecidoCima,
        malhaCima: grupo.malhaCima,

        tecidoBaixo: grupo.tecidoBaixo,
        malhaBaixo: grupo.malhaBaixo,

        P,
        M,
        G,
        GG,
        EX,

        total: P + M + G + GG + EX
    });
}


consolidado.sort((a, b) =>
    a.codigo.localeCompare(b.codigo)
);


fs.writeFileSync(
    path.join(pastaDados, "consolidado.json"),
    JSON.stringify(consolidado, null, 4),
    "utf8"
);

console.log(
    `Arquivo consolidado.json gerado com ${consolidado.length} registros.`
);