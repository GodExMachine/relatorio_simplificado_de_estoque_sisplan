const express = require("express");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

function garantirModulo(modulo) {
    try {
        require.resolve(modulo);
    } catch (erro) {
        console.log(`Modulo "${modulo}" nao encontrado.`);
        console.log(`Instalando ${modulo}...`);
        execSync(`npm install ${modulo}`, { stdio: "inherit" });
        console.log(`${modulo} instalado com sucesso.`);
    }
}

garantirModulo("xlsx");
garantirModulo("multer");

const multer = require("multer");

function obterIPLocal() {
    const interfaces = os.networkInterfaces();

    for (const nome of Object.keys(interfaces)) {
        const nomeLower = nome.toLowerCase();

        if (
            nomeLower.includes("loopback") ||
            nomeLower.includes("vmware") ||
            nomeLower.includes("virtual") ||
            nomeLower.includes("docker") ||
            nomeLower.includes("vbox")
        ) {
            continue;
        }

        for (const info of interfaces[nome]) {
            if (info.family === "IPv4" && !info.internal) {
                return info.address;
            }
        }
    }

    return null;
}

console.log(obterIPLocal());

console.log("Gerando codigos...");
execSync("node scripts/gerar_codigos.js", { stdio: "inherit" });

console.log("Gerando estoque...");
execSync("node scripts/gerar_estoque.js", { stdio: "inherit" });

console.log("Gerando consolidado...");
execSync("node scripts/consolidado.js", { stdio: "inherit" });

console.log("Arquivos gerados.");

const app = express();
const PORT = 3030;

const ipLocal = obterIPLocal();

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/estoque", (req, res) => {
    try {
        const dados = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, "dados", "consolidado.json"),
                "utf8"
            )
        );

        res.json(dados);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

app.get("/data", (req, res) => {
    try {
        const filePath = path.join(__dirname, "dados", "data.json");

        if (!fs.existsSync(filePath)) {
            res.send("sem data");
            return;
        }

        const dados = fs.readFileSync(filePath, "utf8");
        res.setHeader("Content-Type", "application/json");
        res.send(dados);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

const uploadPath = path.join(__dirname, "dados");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, "dados.csv");
    }
});

const upload = multer({ storage });

app.post("/upload-csv", upload.single("file"), (req, res) => {
    try {
        const dataPath = path.join(__dirname, "dados", "data.json");


        const agora = new Date();

        const dia = String(agora.getDate()).padStart(2, "0");
        const mes = String(agora.getMonth() + 1).padStart(2, "0");
        const ano = agora.getFullYear();

        const hora = String(agora.getHours()).padStart(2, "0");
        const minuto = String(agora.getMinutes()).padStart(2, "0");

        const formatado = `${dia}/${mes}/${ano} ${hora}:${minuto}`;

        fs.writeFileSync(dataPath, formatado, "utf8");

        execSync("node scripts/gerar_codigos.js", { stdio: "inherit" });
        execSync("node scripts/gerar_estoque.js", { stdio: "inherit" });
        execSync("node scripts/consolidado.js", { stdio: "inherit" });

        res.json({ ok: true });

    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});



app.get("/tutorial", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "tutorial.html"));
});

app.use("/tutorial", express.static(path.join(__dirname, "views", "tutorial")));

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Site Local : http://localhost:${PORT}`);
    console.log(`API        : http://localhost:${PORT}/estoque`);
    console.log(`Rede       : http://${ipLocal}:${PORT}`);
});