import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BankFileParser } from '../lib/bank-file-parser'
import type { BankFileFormat, BankFileParseResult } from '../lib/types'

describe('BankFileParser', () => {
    // Helper para criar File mock
    const createMockFile = (name: string, content: string): File => {
        const blob = new Blob([content], { type: 'text/plain' })
        return new File([blob], name, { type: 'text/plain' })
    }

    describe('CSV Parser', () => {
        it('deve parsear CSV com vírgula como separador', async () => {
            const csvContent = `Data,Descrição,Valor
01/11/2024,Compra Supermercado,-150.50
02/11/2024,Salário,3500.00
03/11/2024,Aluguel,-1200.00`

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions).toHaveLength(3)
            expect(result.format).toBe('csv')
            expect(result.transactions[0]).toMatchObject({
                description: 'Compra Supermercado',
                amount: 150.50,
                type: 'expense'
            })
            expect(result.transactions[1]).toMatchObject({
                description: 'Salário',
                amount: 3500.00,
                type: 'income'
            })
        })

        it('deve parsear CSV com ponto-e-vírgula como separador', async () => {
            const csvContent = `Data;Descrição;Valor
01/11/2024;Compra Farmácia;-45,80
02/11/2024;Freelance;850,00`

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions).toHaveLength(2)
            expect(result.transactions[0].description).toBe('Compra Farmácia')
        })

        it('deve parsear CSV com colunas Débito/Crédito separadas', async () => {
            const csvContent = `Data,Descrição,Débito,Crédito
01/11/2024,Compra,150.00,0.00
02/11/2024,Depósito,0.00,500.00`

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions).toHaveLength(2)
            expect(result.transactions[0].type).toBe('expense')
            expect(result.transactions[1].type).toBe('income')
        })

        it('deve lidar com CSV contendo campos entre aspas', async () => {
            const csvContent = `Data,Descrição,Valor
01/11/2024,"Compra em ""Supermercado XYZ"",-150.50
02/11/2024,"Transferência, PIX",-100.00"`

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions.length).toBeGreaterThan(0)
        })

        it('deve ignorar linhas vazias ou incompletas no CSV', async () => {
            const csvContent = `Data,Descrição,Valor
01/11/2024,Compra,-150.50

02/11/2024,Salário,3500.00
,,
03/11/2024,Aluguel,-1200.00`

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions).toHaveLength(3)
        })

        it('deve retornar erro para CSV vazio', async () => {
            const csvContent = ``

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(false)
            expect(result.errors.length).toBeGreaterThan(0)
        })
    })

    describe('OFX Parser', () => {
        it('deve parsear arquivo OFX básico', async () => {
            const ofxContent = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTTRN>
<DTPOSTED>20241101
<TRNAMT>-150.50
<MEMO>Compra Supermercado
</STMTTRN>
<STMTTRN>
<DTPOSTED>20241102
<TRNAMT>3500.00
<NAME>Salário
</STMTTRN>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`

            const file = createMockFile('extrato.ofx', ofxContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.format).toBe('ofx')
            expect(result.transactions).toHaveLength(2)
            expect(result.transactions[0]).toMatchObject({
                description: 'Compra Supermercado',
                amount: 150.50,
                type: 'expense'
            })
        })

        it('deve parsear OFX com tag NAME quando MEMO não existe', async () => {
            const ofxContent = `<OFX>
<STMTTRN>
<DTPOSTED>20241101
<TRNAMT>-100.00
<NAME>Compra Online
</STMTTRN>
</OFX>`

            const file = createMockFile('extrato.ofx', ofxContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions).toHaveLength(1)
            expect(result.transactions[0].description).toBe('Compra Online')
        })

        it('deve lidar com OFX sem descrição', async () => {
            const ofxContent = `<OFX>
<STMTTRN>
<DTPOSTED>20241101
<TRNAMT>-50.00
</STMTTRN>
</OFX>`

            const file = createMockFile('extrato.ofx', ofxContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions).toHaveLength(1)
            expect(result.transactions[0].description).toBe('Transação')
        })
    })

    describe('TXT Parser', () => {
        it('deve parsear arquivo TXT com formato padrão', async () => {
            const txtContent = `Extrato Bancário
Data: 01/11/2024 Descrição: Compra Supermercado Valor: -R$ 150,50
Data: 02/11/2024 Descrição: Salário Valor: R$ 3.500,00`

            const file = createMockFile('extrato.txt', txtContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.format).toBe('txt')
            expect(result.transactions.length).toBeGreaterThan(0)
        })

        it('deve parsear TXT com padrão alternativo (tabela)', async () => {
            const txtContent = `01/11/2024    Compra Supermercado    -150.50
02/11/2024    Salário                 3500.00`

            const file = createMockFile('extrato.txt', txtContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions.length).toBeGreaterThan(0)
        })
    })

    describe('Date Parsing', () => {
        it('deve parsear datas em formato brasileiro (DD/MM/YYYY)', async () => {
            const csvContent = `Data,Descrição,Valor
15/11/2024,Compra,-100.00`

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions[0].date).toBe('2024-11-15')
        })

        it('deve parsear datas em formato americano (YYYY-MM-DD)', async () => {
            const csvContent = `Data,Descrição,Valor
2024-11-15,Compra,-100.00`

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions[0].date).toBe('2024-11-15')
        })

        it('deve ignorar transações com datas inválidas', async () => {
            const csvContent = `Data,Descrição,Valor
InvalidDate,Compra,-100.00
15/11/2024,Compra Válida,-50.00`

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions).toHaveLength(1)
            expect(result.transactions[0].description).toBe('Compra Válida')
        })
    })

    describe('Amount Parsing', () => {
        it('deve parsear valores com vírgula decimal (padrão BR)', async () => {
            const csvContent = `Data,Descrição,Valor
01/11/2024,Compra,"1.234,56"`

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions[0].amount).toBe(1234.56)
        })

        it('deve parsear valores com ponto decimal (padrão US)', async () => {
            const csvContent = `Data,Descrição,Valor
01/11/2024,Compra,1234.56`

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions[0].amount).toBe(1234.56)
        })

        it('deve parsear valores com símbolo de moeda (R$)', async () => {
            const csvContent = `Data,Descrição,Valor
01/11/2024,Compra,"R$ 150,50"`

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions[0].amount).toBe(150.50)
        })

        it('deve ignorar transações com valores malformados', async () => {
            const csvContent = `Data,Descrição,Valor
01/11/2024,Compra Inválida,ABC
02/11/2024,Compra Válida,-50.00`

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions).toHaveLength(1)
            expect(result.transactions[0].description).toBe('Compra Válida')
        })
    })

    describe('Category Suggestion', () => {
        it('deve sugerir categoria "food" para compras de supermercado', async () => {
            const csvContent = `Data,Descrição,Valor
01/11/2024,Supermercado Extra,-150.00
02/11/2024,Padaria,-20.00`

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions[0].category).toBe('food')
            expect(result.transactions[1].category).toBe('food')
        })

        it('deve sugerir categoria "transport" para combustível e transporte', async () => {
            const csvContent = `Data,Descrição,Valor
01/11/2024,Posto Gasolina,-200.00
02/11/2024,Uber,-45.00`

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions[0].category).toBe('transport')
            expect(result.transactions[1].category).toBe('transport')
        })

        it('deve sugerir categoria "health" para farmácia', async () => {
            const csvContent = `Data,Descrição,Valor
01/11/2024,Farmácia Drogasil,-80.00`

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions[0].category).toBe('health')
        })

        it('deve usar categoria "other" quando não reconhece o padrão', async () => {
            const csvContent = `Data,Descrição,Valor
01/11/2024,Compra Genérica XYZ,-100.00`

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.success).toBe(true)
            expect(result.transactions[0].category).toBe('other')
        })
    })

    describe('Format Detection', () => {
        it('deve detectar formato CSV pela extensão', async () => {
            const csvContent = `Data,Descrição,Valor
01/11/2024,Compra,-100.00`

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.format).toBe('csv')
        })

        it('deve detectar formato OFX pelo conteúdo', async () => {
            const ofxContent = `<OFX><STMTTRN></STMTTRN></OFX>`

            const file = createMockFile('extrato.txt', ofxContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.format).toBe('ofx')
        })

        it('deve detectar formato TXT quando não é CSV nem OFX', async () => {
            const txtContent = `Extrato simples sem formato específico`

            const file = createMockFile('extrato.txt', txtContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.format).toBe('txt')
        })
    })

    describe('Error Handling', () => {
        it('deve retornar resultado com success=false quando há erro geral', async () => {
            const invalidContent = null as any
            const file = createMockFile('invalid.csv', invalidContent)
            const parser = new BankFileParser(file)

            // Mock readFile para simular erro
            vi.spyOn(parser as any, 'readFile').mockRejectedValue(new Error('File read error'))

            const result = await parser.parse(file)

            expect(result.success).toBe(false)
            expect(result.errors.length).toBeGreaterThan(0)
            expect(result.transactions).toHaveLength(0)
        })

        it('deve incluir nome do arquivo no resultado', async () => {
            const csvContent = `Data,Descrição,Valor
01/11/2024,Compra,-100.00`

            const file = createMockFile('meu-extrato-novembro.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.fileName).toBe('meu-extrato-novembro.csv')
        })

        it('deve contar corretamente o total de transações parseadas', async () => {
            const csvContent = `Data,Descrição,Valor
01/11/2024,Compra 1,-100.00
02/11/2024,Compra 2,-50.00
03/11/2024,Salário,3000.00`

            const file = createMockFile('extrato.csv', csvContent)
            const parser = new BankFileParser(file)
            const result = await parser.parse(file)

            expect(result.totalParsed).toBe(3)
        })
    })
})
