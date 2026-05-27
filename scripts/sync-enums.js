import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
let VITE_API_BASE_URL = '';
let VITE_API_PREFIX = '';
let VITE_API_KEY = '';

if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    if (line.startsWith('VITE_API_BASE_URL=')) {
      VITE_API_BASE_URL = line.split('=')[1].trim();
    }
    if (line.startsWith('VITE_API_PREFIX=')) {
      VITE_API_PREFIX = line.split('=')[1].trim();
    }
    if (line.startsWith('VITE_API_KEY=')) {
      VITE_API_KEY = line.split('=')[1].trim();
    }
  });
}

if (!VITE_API_BASE_URL) {
  console.error('Error: VITE_API_BASE_URL is missing in .env file!');
  process.exit(1);
}

if (!VITE_API_KEY) {
  console.error('Error: VITE_API_KEY is missing in .env file!');
  process.exit(1);
}

const API_URL = `${VITE_API_BASE_URL}${VITE_API_PREFIX}/public/admin-enums`;
const OUTPUT_FILE = path.join(__dirname, '../src/types/enums.ts');

console.log('Fetching enums from:', API_URL);

fetch(API_URL, {
  headers: {
    'Accept': 'application/json',
    'x-api-key': VITE_API_KEY
  }
})
  .then(res => res.json())
  .then(json => {
    if (!json.success || !json.data) {
      console.error('Failed to fetch enums or unexpected format.');
      process.exit(1);
    }

    const enums = json.data;
    let tsContent = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.\n// Run 'npm run sync:enums' to update.\n\n`;
    
    for (const [enumName, enumValues] of Object.entries(enums)) {
      tsContent += `export enum ${enumName} {\n`;
      for (const [key, value] of Object.entries(enumValues)) {
        tsContent += `  ${key} = '${value}',\n`;
      }
      tsContent += `}\n\n`;
    }
    
    fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf8');
    console.log('Successfully synced enums to src/types/enums.ts');
  })
  .catch(err => {
    console.error('Error fetching enums:', err);
    process.exit(1);
  });
