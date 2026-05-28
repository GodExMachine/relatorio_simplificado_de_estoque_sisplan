function gerarPDF() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape" });

    const titulo = document.getElementById("tituloRelatorio").innerText;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(titulo, 14, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 18);

    const headers = [];

    document.querySelectorAll("#tabela thead th").forEach(th => {
        headers.push(th.innerText);
    });

    const body = [];


    let soma7 = 0;
    let soma8 = 0;
    let soma9 = 0;
    let soma10 = 0;
    let soma11 = 0;
    let soma12 = 0;

    const toggleLinhasExtras = document.getElementById('toggleLinhasExtras');
    const qtdLinhasExtras = document.getElementById('qtdLinhasExtras');

    document.querySelectorAll("#tbody tr").forEach(tr => {

        const row = [];

        tr.querySelectorAll("td").forEach((td, index) => {

            const valor = td.innerText.trim();

          
            const num = parseInt(
                valor.replace(/\./g, '').replace(',', '.')
            );

           
            if (!isNaN(num)) {

                if (index === 6) soma7 += num;
                if (index === 7) soma8 += num;
                if (index === 8) soma9 += num;
                if (index === 9) soma10 += num;
                if (index === 10) soma11 += num;
                if (index === 11) soma12 += num;
            }

            
            if (!isNaN(num) && num <= 0) {

                row.push({
                    content: valor,
                    styles: {
                        textColor: [200, 0, 0],
                        fontStyle: "bold"
                    }
                });

            } else {

                row.push(valor);
            }
        });

        body.push(row);

       
        if (toggleLinhasExtras.checked) {

            const qtd = parseInt(qtdLinhasExtras.value) || 1;

            for (let i = 0; i < qtd; i++) {

                const emptyRow = [];

                for (let c = 0; c < row.length; c++) {
                    emptyRow.push("");
                }

                body.push(emptyRow);
            }
        }
    });


    const linhaTotal = [];

    headers.forEach((_, index) => {

        if (index === 1) {

            linhaTotal.push("TOTAL GERAL");

        }
        else if (index === 6) {

            linhaTotal.push(soma7.toString());

        }
        else if (index === 7) {

            linhaTotal.push(soma8.toString());

        }
        else if (index === 8) {

            linhaTotal.push(soma9.toString());

        }
        else if (index === 9) {

            linhaTotal.push(soma10.toString());

        }
        else if (index === 10) {

            linhaTotal.push(soma11.toString());

        }
        else if (index === 11) {

            linhaTotal.push(soma12.toString());

        }
        else {

            linhaTotal.push("");
        }
    });

    body.push(linhaTotal);

    doc.autoTable({

        head: [headers],
        body: body,
        startY: 20,
        theme: "grid",

        margin: {
            left: 5,
            right: 5
        },

        styles: {
            fontSize: 7,
            halign: "center"
        },

        columnStyles: {

            1: {
                halign: "left",
                cellWidth: 60
            },

            2: {
                cellWidth: 30,
                fillColor: [250, 250, 250]
            },

            3: {
                cellWidth: 30,
                fillColor: [250, 250, 250]
            },

            4: {
                cellWidth: 30,
                fillColor: [245, 248, 252]
            },

            5: {
                cellWidth: 30,
                fillColor: [245, 248, 252]
            }
        },

        headStyles: {
            fillColor: [30, 30, 30],
            textColor: 255,
            fontStyle: "bold"
        },

        didParseCell: function (data) {

            const texto = data.cell.text?.[0];

           
            if (data.row.index === body.length - 1) {

                data.cell.styles.fillColor = [220, 220, 220];
                data.cell.styles.fontStyle = "bold";
                data.cell.styles.textColor = [0, 0, 0];
            }

    
            if (texto && !isNaN(Number(texto)) && Number(texto) <= 0) {

                data.cell.styles.textColor = [200, 0, 0];
                data.cell.styles.fontStyle = "bold";
                data.cell.styles.fillColor = [245, 225, 225];
            }
        }
    });


    const totalPages = doc.internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {

        doc.setPage(i);

        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        doc.setFontSize(9);

        doc.text(
            `Página ${i}/${totalPages}`,
            pageWidth / 2,
            pageHeight - 5,
            { align: "center" }
        );
    }

    
doc.autoPrint();

window.open(doc.output('bloburl'), '_blank');
}