# 📄 Exemplos de PDF para Teste

## Como criar um PDF de teste

Como o pdfjs-dist extrai texto de PDFs, qualquer PDF de extrato bancário funcionará.

### Opção 1: Usar PDF existente
Exporte um extrato bancário do seu banco em PDF e teste!

### Opção 2: Criar PDF via texto
Exemplos de formatos que o parser reconhece:

```
DATA        DESCRIÇÃO                    VALOR
20/11/2025  Débito Conta                 -150,00
21/11/2025  Depósito Salário           +2.500,00
22/11/2025  Compra Supermercado         -85,50
```

Ou formatos bancários brasileiros com layout:

```
DATA         HISTÓRICO           D/C    SALDO
20/11/2025   Transferência        D    -150,00
21/11/2025   Depósito             C   2.350,00
```

## Formatos Reconhecidos

O parser PDF detecta:

✅ Datas em formato DD/MM/YYYY, MM/DD/YYYY, YYYY/MM/DD
✅ Valores monetários com R$ ou separador decimal (,. ou .)
✅ Descrição da transação
✅ Débitos (valores negativos) e Créditos (positivos)

## Teste no App

1. Gere um PDF com um dos formatos acima
2. Arraste para o uploader ou clique para selecionar
3. O parser extrairá o texto e tentará identificar as transações
4. As transações aparecerão na lista com data, descrição e valor
