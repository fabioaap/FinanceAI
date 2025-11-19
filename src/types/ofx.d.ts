declare module 'ofx' {
  export interface OFXTransaction {
    FITID?: string;
    DTPOSTED: string;
    TRNAMT: string;
    MEMO?: string;
    NAME?: string;
    [key: string]: unknown;
  }

  export interface OFXBankAccount {
    ACCTID?: string;
    BANKID?: string;
    ACCTTYPE?: string;
    [key: string]: unknown;
  }

  export interface OFXTransactionList {
    DTSTART?: string;
    DTEND?: string;
    STMTTRN?: OFXTransaction | OFXTransaction[];
    [key: string]: unknown;
  }

  export interface OFXBankStatement {
    BANKACCTFROM?: OFXBankAccount;
    BANKTRANLIST?: OFXTransactionList;
    CURDEF?: string;
    [key: string]: unknown;
  }

  export interface OFXStatementResponse {
    STMTRS?: OFXBankStatement;
    [key: string]: unknown;
  }

  export interface OFXBankMessageResponse {
    STMTTRNRS?: OFXStatementResponse;
    [key: string]: unknown;
  }

  export interface OFXRoot {
    BANKMSGSRSV1?: OFXBankMessageResponse;
    [key: string]: unknown;
  }

  export interface OFXBody {
    OFX?: OFXRoot;
    [key: string]: unknown;
  }

  export interface OFXData {
    header?: Record<string, string>;
    body?: OFXBody;
    [key: string]: unknown;
  }

  export namespace Banking {
    function parse(ofxString: string): OFXData;
  }
}
