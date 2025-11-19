import { Banking } from 'ofx';
import { ParseResult, Transaction } from '../types/transaction';

export class OFXParser {
  async parse(fileContent: string): Promise<ParseResult> {
    const errors: string[] = [];
    const transactions: Transaction[] = [];

    try {
      const ofxData = Banking.parse(fileContent);

      if (ofxData && ofxData.body && ofxData.body.OFX) {
        const bankStatement = ofxData.body.OFX.BANKMSGSRSV1?.STMTTRNRS?.STMTRS;
        
        if (!bankStatement) {
          errors.push('Formato OFX inválido: estrutura de extrato não encontrada');
          return { transactions, errors };
        }

        const accountInfo = {
          accountId: bankStatement.BANKACCTFROM?.ACCTID,
          bankId: bankStatement.BANKACCTFROM?.BANKID,
          accountType: bankStatement.BANKACCTFROM?.ACCTTYPE,
          currency: bankStatement.CURDEF,
          startDate: bankStatement.BANKTRANLIST?.DTSTART 
            ? this.parseOFXDate(bankStatement.BANKTRANLIST.DTSTART) 
            : undefined,
          endDate: bankStatement.BANKTRANLIST?.DTEND 
            ? this.parseOFXDate(bankStatement.BANKTRANLIST.DTEND) 
            : undefined,
        };

        const transactionList = bankStatement.BANKTRANLIST?.STMTTRN || [];
        const transList = Array.isArray(transactionList) ? transactionList : [transactionList];

        transList.forEach((trn: unknown) => {
          try {
            const transaction = trn as {
              FITID?: string;
              DTPOSTED: string;
              TRNAMT: string;
              MEMO?: string;
              NAME?: string;
            };
            const amount = parseFloat(transaction.TRNAMT);
            transactions.push({
              id: transaction.FITID,
              date: this.parseOFXDate(transaction.DTPOSTED),
              description: transaction.MEMO || transaction.NAME || 'Sem descrição',
              amount: Math.abs(amount),
              type: amount < 0 ? 'debit' : 'credit',
            });
          } catch (err) {
            errors.push(`Erro ao processar transação: ${err}`);
          }
        });

        return { transactions, accountInfo, errors: errors.length > 0 ? errors : undefined };
      } else {
        errors.push('Formato OFX inválido');
        return { transactions, errors };
      }
    } catch (error) {
      errors.push(`Erro ao processar arquivo OFX: ${error instanceof Error ? error.message : String(error)}`);
      return { transactions, errors };
    }
  }

  private parseOFXDate(dateString: string): Date {
    // OFX date format: YYYYMMDDHHMMSS
    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(4, 6)) - 1; // JS months are 0-indexed
    const day = parseInt(dateString.substring(6, 8));
    const hour = dateString.length >= 10 ? parseInt(dateString.substring(8, 10)) : 0;
    const minute = dateString.length >= 12 ? parseInt(dateString.substring(10, 12)) : 0;
    const second = dateString.length >= 14 ? parseInt(dateString.substring(12, 14)) : 0;

    return new Date(year, month, day, hour, minute, second);
  }
}
