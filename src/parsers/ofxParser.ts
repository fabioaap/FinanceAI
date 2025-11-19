import { XMLParser } from 'fast-xml-parser';
import type { Transaction, ParseResult } from '../types';

export function parseOFX(content: string): ParseResult {
  const errors: string[] = [];
  
  try {
    // Remove OFX header and keep only XML content
    const xmlContent = content.substring(content.indexOf('<OFX>'));
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    
    const result = parser.parse(xmlContent);
    
    if (!result.OFX) {
      errors.push('Formato OFX inválido');
      return { transactions: [], errors };
    }

    const bankmsgsrs = result.OFX.BANKMSGSRSV1 || result.OFX.CREDITCARDMSGSRSV1;
    if (!bankmsgsrs) {
      errors.push('Não foi possível encontrar transações no arquivo OFX');
      return { transactions: [], errors };
    }

    const stmttrnrs = bankmsgsrs.STMTTRNRS || bankmsgsrs.CCSTMTTRNRS;
    if (!stmttrnrs) {
      errors.push('Estrutura de transações não encontrada');
      return { transactions: [], errors };
    }

    const stmtrs = stmttrnrs.STMTRS || stmttrnrs.CCSTMTRS;
    const banktranlist = stmtrs?.BANKTRANLIST || stmtrs?.CCSTMTLIST;
    
    if (!banktranlist || !banktranlist.STMTTRN) {
      errors.push('Nenhuma transação encontrada');
      return { transactions: [], errors };
    }

    const stmttrns = Array.isArray(banktranlist.STMTTRN) 
      ? banktranlist.STMTTRN 
      : [banktranlist.STMTTRN];

    const transactions: Transaction[] = stmttrns.map((trn: Record<string, unknown>) => {
      const amount = parseFloat(String(trn.TRNAMT));
      return {
        date: parseOFXDate(String(trn.DTPOSTED)),
        description: String(trn.MEMO || trn.NAME || 'Sem descrição'),
        amount: Math.abs(amount),
        type: amount < 0 ? 'debit' : 'credit',
      };
    });

    const accountInfo = {
      accountNumber: stmtrs?.BANKACCTFROM?.ACCTID || stmtrs?.CCACCTFROM?.ACCTID,
      bankId: stmtrs?.BANKACCTFROM?.BANKID || stmtrs?.CCACCTFROM?.BANKID,
      currency: stmtrs?.CURDEF || 'BRL',
    };

    return { transactions, accountInfo, errors: errors.length > 0 ? errors : undefined };
  } catch (error) {
    errors.push(`Erro ao processar arquivo OFX: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    return { transactions: [], errors };
  }
}

function parseOFXDate(dateStr: string): Date {
  // OFX date format: YYYYMMDDHHMMSS
  if (!dateStr || dateStr.length < 8) {
    return new Date();
  }
  
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  const hour = dateStr.length >= 10 ? parseInt(dateStr.substring(8, 10)) : 0;
  const minute = dateStr.length >= 12 ? parseInt(dateStr.substring(10, 12)) : 0;
  const second = dateStr.length >= 14 ? parseInt(dateStr.substring(12, 14)) : 0;
  
  return new Date(year, month, day, hour, minute, second);
}
