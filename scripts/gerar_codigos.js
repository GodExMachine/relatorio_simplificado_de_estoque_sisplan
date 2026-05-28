const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");


const arquivoExcel = path.join(__dirname, "..", "dados", "CODIGOS.xlsx");

const pastaDados = path.join(__dirname, "..", "dados");
const arquivoSaida = path.join(pastaDados, "codigos.json");


const workbook = XLSX.readFile(arquivoExcel);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];


const dados = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const agrupamentos = [];


for (let i = 1; i < dados.length; i++) {
    const linha = dados[i];

    const codigoOriginal = String(linha[0] || "").trim();
    const descricao = String(linha[1] || "").trim();
    const tecido = String(linha[2] || "").trim();
    const malha = String(linha[3] || "").trim();

    if (!codigoOriginal) continue;

    let tipoLinha = "AVULSO";
    let codigo = codigoOriginal;

    const match = codigoOriginal.match(/^(.*?)\s+([A-Z])$/);

    if (match) {
        codigo = match[1];

        switch (match[2]) {
            case "A":
                tipoLinha = "CIMA";
                break;
            case "B":
                tipoLinha = "BAIXO";
                break;
            case "C":
                tipoLinha = "MANGA";
                break;
            default:
                tipoLinha = match[2];
        }
    }

    agrupamentos.push({
        codigo,
        linha: tipoLinha,
        descricao,
        tecido,
        malha
    });
}


if (!fs.existsSync(pastaDados)) {
    fs.mkdirSync(pastaDados, { recursive: true });
}

fs.writeFileSync(
    arquivoSaida,
    JSON.stringify(agrupamentos, null, 4),
    "utf8"
);

console.log(`Arquivo codigos.json gerado com ${agrupamentos.length} registros.`);