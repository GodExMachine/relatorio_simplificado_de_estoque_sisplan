const tbody = document.getElementById("tbody");
const btnFiltrar = document.getElementById("btnFiltrar");

let estoque = [];
let exCodigos = new Set();

async function carregarEx() {
    const response = await fetch("/scripts/EX.json");
    const dados = await response.json();

    exCodigos = new Set(dados.map(item => item.codigo.trim()));
}

async function carregarDados() {
    try {
        await carregarEx();

        const response = await fetch("/estoque");
        estoque = await response.json();

        renderizarTabela(estoque);
    } catch (erro) {
        console.error("Erro ao carregar estoque:", erro);
    }
}

function renderizarTabela(dados) {
    tbody.innerHTML = "";

    dados.forEach(item => {
        let exValor = item.EX;

        if (exCodigos.has(String(item.codigo).trim())) {
            exValor = "X";
        }

        tbody.innerHTML += `
            <tr>
                <td class="codigo-produto" data-codigo="${item.codigo}">${item.codigo}</td>
                <td>${item.descricao}</td>
                <td>${item.tecidoCima}</td>
                <td>${item.malhaCima}</td>
                <td>${item.tecidoBaixo}</td>
                <td>${item.malhaBaixo}</td>
                <td>${item.P}</td>
                <td>${item.M}</td>
                <td>${item.G}</td>
                <td>${item.GG}</td>
                <td>${exValor}</td>
                <td>${item.total}</td>
            </tr>
        `;
    });

    marcarEstoqueBaixo();
    atualizarTotais(dados);
}

btnFiltrar.addEventListener("click", () => {
    const codigo = document.getElementById("filtroCodigo").value.toUpperCase();
    const tecido = document.getElementById("filtroTecido").value.toUpperCase();
    const malha = document.getElementById("filtroMalha").value.toUpperCase();

    const resultado = estoque.filter(item => {
        const matchCodigo = !codigo || item.codigo.toUpperCase().includes(codigo);

        const matchTecido =
            !tecido ||
            item.tecidoCima.toUpperCase().includes(tecido) ||
            item.tecidoBaixo.toUpperCase().includes(tecido);

        const matchMalha =
            !malha ||
            item.malhaCima.toUpperCase().includes(malha) ||
            item.malhaBaixo.toUpperCase().includes(malha);

        return matchCodigo && matchTecido && matchMalha;
    });

    renderizarTabela(resultado);
});

const toggle = document.getElementById("toggleLinhasExtras");
const qtd = document.getElementById("qtdLinhasExtras");
const labelQtd = document.getElementById("labelQtd");

toggle.addEventListener("change", () => {
    const show = toggle.checked;
    qtd.style.display = show ? "inline-block" : "none";
    labelQtd.style.display = show ? "inline-block" : "none";
});

function marcarEstoqueBaixo() {
    const linhas = document.querySelectorAll("#tbody tr");

    linhas.forEach(linha => {
        const celulas = linha.querySelectorAll("td");

        for (let i = 6; i <= 10; i++) {
            const valor = parseInt(celulas[i].textContent);

            if (!isNaN(valor) && valor <= 0) {
                celulas[i].classList.add("estoque-baixo");
            }
        }
    });
}

async function carregarDataTitulo() {
    try {
        const response = await fetch("/data");
        const data = await response.text();

        document.getElementById("tituloRelatorio").innerText =
            `Relatório de Estoque POSIÇÃO DO ESTOQUE ${data}`;

    } catch (erro) {
        console.error("Erro ao carregar data:", erro);
    }
}

function atualizarTotais(dados) {
    let totalP = 0;
    let totalM = 0;
    let totalG = 0;
    let totalGG = 0;
    let totalEX = 0;
    let totalGeral = 0;

    dados.forEach(item => {
        totalP += Number(item.P) || 0;
        totalM += Number(item.M) || 0;
        totalG += Number(item.G) || 0;
        totalGG += Number(item.GG) || 0;
        totalEX += Number(item.EX) || 0;
        totalGeral += Number(item.total) || 0;
    });

    document.getElementById("totalP").textContent = totalP;
    document.getElementById("totalM").textContent = totalM;
    document.getElementById("totalG").textContent = totalG;
    document.getElementById("totalGG").textContent = totalGG;
    document.getElementById("totalEX").textContent = totalEX;
    document.getElementById("totalGeral").textContent = totalGeral;
}

const previewFoto = document.getElementById("previewFoto");
const previewImagem = document.getElementById("previewImagem");

document.addEventListener("mouseover", (e) => {
    const td = e.target.closest(".codigo-produto");
    if (!td) return;

    const codigo = td.dataset.codigo;

    previewImagem.src = `/fotos/${codigo}.jpg`;
    previewFoto.style.display = "block";
});

document.addEventListener("mousemove", (e) => {
    if (previewFoto.style.display === "block") {
        previewFoto.style.left = (e.clientX + 20) + "px";
        previewFoto.style.top = (e.clientY + 20) + "px";
    }
});

document.addEventListener("mouseout", (e) => {
    if (e.target.closest(".codigo-produto")) {
        previewFoto.style.display = "none";
    }
});

previewImagem.addEventListener("error", () => {
    previewFoto.style.display = "none";
});

const dropZone = document.getElementById("dropZone");
const inputCsv = document.getElementById("inputCsv");

dropZone.addEventListener("click", () => {
    inputCsv.click();
});

inputCsv.addEventListener("change", () => {
    handleFile(inputCsv.files[0]);
});

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    handleFile(e.dataTransfer.files[0]);
});

function handleFile(file) {
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
        alert("Apenas arquivo CSV");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fetch("/upload-csv", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(() => {

        dropZone.classList.add("success");

        const span = dropZone.querySelector("span");
        if (span) {
            span.textContent = `Enviado`;
        }

        setTimeout(() => {
            dropZone.classList.remove("success");
            if (span) {
                span.textContent = "Enviar arquivo";
            }
        }, 2500);

        carregarDados();
        carregarDataTitulo();
    })
    .catch(() => {
        const span = dropZone.querySelector("span");
        if (span) {
            span.textContent = "Erro ao enviar arquivo";
        }
    });
}

carregarDados();
carregarDataTitulo();