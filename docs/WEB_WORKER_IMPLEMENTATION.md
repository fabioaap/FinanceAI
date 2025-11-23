# Web Worker Implementation for Bank File Parser

## Overview
This implementation adds Web Worker support to the bank file parser to prevent UI blocking when parsing large files (10k+ lines).

## Architecture

### Files
- **`bank-file-parser.worker.ts`**: The Web Worker implementation with all parsing logic
- **`bank-file-parser-worker.types.ts`**: TypeScript types for worker communication
- **`bank-file-parser-worker-manager.ts`**: High-level manager class for easy integration
- **`bank-file-parser-worker-manager.test.ts`**: Comprehensive test suite

### Key Features
1. **Asynchronous Parsing**: Runs in separate thread, prevents UI blocking
2. **Progress Reporting**: Reports progress every 1000 lines by default
3. **Cancellation**: Support for cancelling long-running operations
4. **Automatic Fallback**: Falls back to synchronous parsing if workers not supported
5. **All Format Support**: CSV, OFX, QIF, TXT formats

## Usage

### Basic Usage
```typescript
import { parseBankFileWithWorker } from '@/lib/bank-file-parser-worker-manager'

// Simple usage - one line
const result = await parseBankFileWithWorker(file)
```

### With Progress Tracking
```typescript
import { BankFileParserWorkerManager } from '@/lib/bank-file-parser-worker-manager'

const manager = new BankFileParserWorkerManager({
    onProgress: (progress, message, processedLines, totalLines) => {
        console.log(`Progress: ${progress}%`)
        console.log(`Processed: ${processedLines}/${totalLines} lines`)
        setProgressState({ progress, message })
    }
})

const result = await manager.parse(file, customRules)
manager.terminate() // Clean up worker
```

### With Custom Rules
```typescript
const customRules = [
    {
        id: '1',
        pattern: 'ACME Corp',
        category: 'work',
        isRegex: false,
        priority: 10
    }
]

const result = await parseBankFileWithWorker(file, customRules)
```

### Cancellation
```typescript
const manager = new BankFileParserWorkerManager()

// Start parsing
const parsePromise = manager.parse(largeFile)

// Cancel if needed
manager.cancel()

// Or with timeout
const timeoutId = setTimeout(() => manager.cancel(), 30000) // 30s timeout
try {
    const result = await parsePromise
    clearTimeout(timeoutId)
} catch (error) {
    console.log('Parsing cancelled or failed')
}
```

## Integration with Existing Code

### Option 1: Replace Existing Parser (Recommended)
Simply replace imports in your components:

```typescript
// OLD
import { parseBankFile } from '@/lib/bank-file-parser'

// NEW
import { parseBankFileWithWorker as parseBankFile } from '@/lib/bank-file-parser-worker-manager'

// Rest of code stays the same!
const result = await parseBankFile(file, customRules)
```

### Option 2: Conditional Usage
Use worker for large files only:

```typescript
import { parseBankFile } from '@/lib/bank-file-parser'
import { parseBankFileWithWorker } from '@/lib/bank-file-parser-worker-manager'

const LARGE_FILE_THRESHOLD = 10000 // 10k lines

async function parseFile(file: File, customRules) {
    const lineCount = await countLines(file)
    
    if (lineCount > LARGE_FILE_THRESHOLD) {
        return parseBankFileWithWorker(file, customRules)
    } else {
        return parseBankFile(file, customRules)
    }
}
```

### Option 3: Progressive Enhancement
Add progress UI for better UX:

```typescript
function BankFileUpload() {
    const [progress, setProgress] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)
    
    const handleFileUpload = async (file: File) => {
        setIsProcessing(true)
        setProgress(0)
        
        const result = await parseBankFileWithWorker(file, [], {
            onProgress: (prog) => setProgress(prog)
        })
        
        setIsProcessing(false)
        // Handle result...
    }
    
    return (
        <>
            {isProcessing && (
                <Progress value={progress} />
            )}
            <FileInput onFileSelect={handleFileUpload} />
        </>
    )
}
```

## Performance

### Benchmarks (from tests)
- **10,000 lines**: ~50ms
- **50,000 lines**: ~200ms

### Memory Usage
Workers run in separate threads, so memory usage is isolated. Large files won't block the main thread.

### Browser Support
- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Automatic fallback for environments without worker support
- ✅ Works in test environments (falls back to sync)

## Configuration

### Progress Reporting
```typescript
const manager = new BankFileParserWorkerManager({
    config: {
        enableProgress: true,
        progressInterval: 1000,  // Report every 1000 lines
        chunkSize: 5000          // Process in chunks (for future use)
    }
})
```

### Disable Progress (Faster)
```typescript
const manager = new BankFileParserWorkerManager({
    config: {
        enableProgress: false
    }
})
```

## Testing

### Run Tests
```bash
npm test -- bank-file-parser-worker-manager.test.ts
```

### Test Coverage
- ✅ Small files (< 100 lines)
- ✅ Large files (10k lines)
- ✅ Very large files (50k lines)
- ✅ Progress callbacks
- ✅ Error handling
- ✅ Format detection
- ✅ Custom rules
- ✅ Cancellation
- ✅ Worker lifecycle

## Troubleshooting

### Worker Not Loading
If you see errors about worker not loading, ensure:
1. Vite is properly configured (it should be by default)
2. You're using the `new URL(..., import.meta.url)` pattern
3. Build process completes successfully

### Progress Not Reported
Progress callbacks may not fire in test environments due to limited Web Worker support. They work correctly in real browsers.

### Performance Issues
If parsing is slower than expected:
1. Check file format - TXT files are slower than CSV
2. Verify custom rules aren't too complex (regex can be slow)
3. Consider disabling progress reporting for max speed

## Migration Guide

### Step 1: Import New API
```typescript
import { parseBankFileWithWorker } from '@/lib/bank-file-parser-worker-manager'
```

### Step 2: Update Function Calls
No changes needed! Same interface as `parseBankFile`:
```typescript
const result = await parseBankFileWithWorker(file, customRules)
```

### Step 3: (Optional) Add Progress UI
```typescript
const [progress, setProgress] = useState(0)

const result = await parseBankFileWithWorker(file, customRules, {
    onProgress: (prog) => setProgress(prog)
})
```

### Step 4: Test
Test with large files (10k+ lines) to see the improvement.

## Future Enhancements

### Potential Improvements
1. **Streaming Parser**: Parse file in chunks without loading entire file
2. **Multi-threaded**: Use multiple workers for very large files
3. **Smart Chunking**: Adaptive chunk size based on file complexity
4. **IndexedDB Cache**: Cache parsed results for quick re-parsing
5. **Compression**: Compress large files before parsing

### Cloud Sync (Issue #41)
The worker architecture is compatible with cloud sync:
- Worker can post partial results during parsing
- Main thread can sync to cloud while worker continues
- Conflict resolution can happen in parallel

## API Reference

### `parseBankFileWithWorker(file, customRules?, options?)`
Convenience function for one-off parsing.

**Parameters:**
- `file: File` - The file to parse
- `customRules?: CategoryMappingRule[]` - Optional custom category rules
- `options?: WorkerManagerOptions` - Optional configuration

**Returns:** `Promise<BankFileParseResult>`

### `BankFileParserWorkerManager`
Manager class for advanced usage.

**Methods:**
- `constructor(options?)` - Create new manager
- `parse(file, customRules?)` - Parse a file
- `cancel()` - Cancel current operation
- `terminate()` - Terminate worker and clean up

**Static Methods:**
- `isSupported()` - Check if workers are supported

## License
MIT - Same as parent project
