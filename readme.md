Para iniciar o server clique duas vezes em iniciar.vbs

Crie um atalho do arquivo iniciar.vbs na pasta de inicialização do Windows, acessível via Win + R → shell:startup, para que o script seja executado automaticamente sempre que o sistema iniciar.

Comando para desligar o server > taskkill /IM node.exe /F
Ou finalize pelo gerenciador de tarefa

Comando para iniciar o server manualmente -> node server.js

Para permitir acesso de outras maquinas dentro da rede cria uma copia do arquivo ESTOQUE POR ESTAMPA.html e altere a CONST IP para a ip do servidor

---

## Como gerar o arquivo de estoque (dados.csv)

Como não há acesso direto ao banco de dados, o estoque é lido a partir do arquivo dados.csv. Para gerar esse arquivo:

1. Acesse a tela **2253 - Processo**
2. Preencha os campos **Coleção** e **Estoque**
3. Clique em **Consultar**
4. Com o resultado na tela, clique com o **botão direito** sobre ele
5. Escolha **Exportar para .csv**
6. Salve o arquivo como **dados.csv** dentro da mesma pasta do server.js

Após salvar o arquivo, reinicie o server para que o estoque seja atualizado.

## Como gerar o arquivo codigos.xlsx

1. Crie uma planilha nova em branco e salve como **codigos.xlsx** dentro da mesma pasta do server.js
2. Acesse a planilha de OP
3. Copie e cole os valores das colunas: **Código, Descrição, Malha, Cor**
4. Insira uma primeira linha com os valores: `00.000.0000`, `x`, `x`, `x`