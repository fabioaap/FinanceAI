export function detectFormat(fileName: string, content: string): BankFileFormat {
    const extension = fileName.split('.').pop()?.toLowerCase()

    if (extension === 'qif' || content.includes('!Type:')) {
        return 'qif'
    }

    if (extension === 'ofx' || content.includes('OFX') || content.includes('OFXHEADER')) {
        return 'ofx'
    }

    if (extension === 'csv') {
        return 'csv'
    }

    if (extension === 'txt') {
        return 'txt'
    }

    if (content.includes(',') || content.includes(';')) {
        return 'csv'
    }

    return 'txt'
}