const fs = require("fs");
const path = require("path");

const arquivoCsv = path.join(__dirname, "..", "dados.csv");
const pastaDados = path.join(__dirname, "..", "dados");
const arquivoSaida = path.join(pastaDados, "estoque.json");

const config = {
    filtroTipoColuna: "DescTipo",
    filtroTipoValor: "Total",

    codigoColuna: "Codigo",
    descricaoColuna: "Descricao",

    tamanhos: {
        P: "Qtd3",
        M: "Qtd4",
        G: "Qtd5",
        GG: "Qtd6",
        EX: "Qtd7"
    }
};

function limpa(v) {
    return (v || "").replace(/"/g, "").trim();
}

const data = fs.readFileSync(arquivoCsv, "utf8");
const linhas = data.split(/\r?\n/).filter(l => l.trim());

const header = linhas[0].split(";").map(limpa);

const colIndex = {};
header.forEach((col, i) => {
    colIndex[col] = i;
});

const estoque = [];

for (let i = 1; i < linhas.length; i++) {

    const cols = linhas[i].split(";");

    const idxTipo = colIndex[config.filtroTipoColuna];

    if (idxTipo === undefined) {
        continue;
    }

    const tipo = limpa(cols[idxTipo]);

    if (tipo !== config.filtroTipoValor) {
        continue;
    }

    const item = {
        codigo: limpa(cols[colIndex[config.codigoColuna]]),
        descricao: limpa(cols[colIndex[config.descricaoColuna]])
    };

    for (const [tamanho, colunaQtd] of Object.entries(config.tamanhos)) {

        const idx = colIndex[colunaQtd];

        if (idx === undefined) {
            continue;
        }

        const qtd = parseInt(limpa(cols[idx])) || 0;

        item[tamanho] = qtd;
    }

    estoque.push(item);
}

if (!fs.existsSync(pastaDados)) {
    fs.mkdirSync(pastaDados, { recursive: true });
}

fs.writeFileSync(
    arquivoSaida,
    JSON.stringify(estoque, null, 4),
    "utf8"
);

console.log(`OK: estoque.json gerado com ${estoque.length} registros`);