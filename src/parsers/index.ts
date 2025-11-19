import { OFXParser } from './ofxParser';
import { CSVParser } from './csvParser';
import { FileFormat, ParseResult } from '../types/transaction';

export class ParserFactory {
  static async parseFile(file: File): Promise<ParseResult> {
    const format = this.detectFormat(file);
    const content = await this.readFile(file);

    switch (format) {
      case 'ofx':
        return new OFXParser().parse(content);
      case 'csv':
        return new CSVParser().parse(content);
      default:
        return {
          transactions: [],
          errors: ['Formato de arquivo não suportado. Use OFX ou CSV.'],
        };
    }
  }

  private static detectFormat(file: File): FileFormat | null {
    const name = file.name.toLowerCase();
    
    if (name.endsWith('.ofx')) {
      return 'ofx';
    } else if (name.endsWith('.csv')) {
      return 'csv';
    }

    return null;
  }

  private static readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Erro ao ler arquivo'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };
      
      reader.readAsText(file);
    });
  }
}
