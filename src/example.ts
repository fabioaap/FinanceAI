/**
 * Example usage of the Dexie settings system
 * 
 * This file demonstrates common patterns for using the settings storage.
 * You can run this file with: npm run example (after adding the script to package.json)
 */

import { getSetting, setSetting, deleteSetting, getAllSettings } from './lib/db';
import { migrateFromLocalStorage, checkMigrationNeeded } from './lib/migrate';

async function exampleUsage() {
  console.log('=== Dexie Settings Example ===\n');

  // 1. Setting and getting simple values
  console.log('1. Setting app-language to "en-US"');
  await setSetting('app-language', 'en-US');
  const language = await getSetting('app-language');
  console.log(`   Retrieved: ${language}\n`);

  // 2. Setting and getting JSON objects
  console.log('2. Setting theme config (JSON object)');
  const themeConfig = {
    mode: 'dark',
    primaryColor: '#1a1a1a',
    accentColor: '#3b82f6',
    fontSize: 16
  };
  await setSetting('theme-config', themeConfig);
  const themeValue = await getSetting('theme-config');
  if (themeValue) {
    const theme = JSON.parse(themeValue);
    console.log(`   Retrieved theme mode: ${theme.mode}`);
    console.log(`   Primary color: ${theme.primaryColor}\n`);
  }

  // 3. Updating existing settings
  console.log('3. Updating app-language to "pt-BR"');
  await setSetting('app-language', 'pt-BR');
  const newLanguage = await getSetting('app-language');
  console.log(`   Updated language: ${newLanguage}\n`);

  // 4. Getting all settings
  console.log('4. Getting all settings');
  const allSettings = await getAllSettings();
  console.log(`   Total settings: ${allSettings.length}`);
  allSettings.forEach(setting => {
    console.log(`   - ${setting.key}`);
  });
  console.log('');

  // 5. Migration example (if you have localStorage data)
  console.log('5. Migration example');
  
  // Simulate some localStorage data
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('legacy-setting', 'legacy-value');
    localStorage.setItem('old-theme', '{"mode":"light"}');
    
    // Check which keys need migration
    const keysToMigrate = await checkMigrationNeeded(['legacy-setting', 'old-theme']);
    console.log(`   Keys needing migration: ${keysToMigrate.join(', ')}`);
    
    // Perform migration
    const result = await migrateFromLocalStorage(keysToMigrate);
    console.log(`   Migrated ${result.migrated} settings`);
    
    // Verify migration
    const migratedValue = await getSetting('legacy-setting');
    console.log(`   Migrated value: ${migratedValue}\n`);
  }

  // 6. Deleting a setting
  console.log('6. Deleting legacy-setting');
  await deleteSetting('legacy-setting');
  const deleted = await getSetting('legacy-setting');
  console.log(`   Setting exists: ${deleted !== undefined}\n`);

  console.log('=== Example Complete ===');
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleUsage().catch(console.error);
}

export { exampleUsage };
