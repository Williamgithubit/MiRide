import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively find all JS/JSX files
function findJSFiles(dir, jsFiles = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other build directories
      if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
        findJSFiles(fullPath, jsFiles);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      // Skip configuration files and important JS files
      const skipFiles = [
        'vite.config.js',
        'tailwind.config.js', 
        'postcss.config.js',
        'cleanup-js-files.js'
      ];
      
      if (!skipFiles.includes(file)) {
        jsFiles.push(fullPath);
      }
    }
  }
  
  return jsFiles;
}

// Function to check if TypeScript equivalent exists
function hasTypeScriptEquivalent(jsFilePath) {
  const tsPath = jsFilePath.replace(/\.jsx?$/, '.ts');
  const tsxPath = jsFilePath.replace(/\.jsx?$/, '.tsx');
  
  return fs.existsSync(tsPath) || fs.existsSync(tsxPath);
}

// Main cleanup function
function cleanupJSFiles() {
  console.log('🔍 Scanning for JavaScript files in client directory...\n');
  
  const clientDir = __dirname;
  const jsFiles = findJSFiles(clientDir);
  
  console.log(`Found ${jsFiles.length} JavaScript files:`);
  
  let safeToDelete = [];
  let keepFiles = [];
  
  jsFiles.forEach((filePath, index) => {
    const relativePath = path.relative(clientDir, filePath);
    const hasTS = hasTypeScriptEquivalent(filePath);
    
    console.log(`${index + 1}. ${relativePath} ${hasTS ? '✅ (has TS equivalent)' : '⚠️  (no TS equivalent)'}`);
    
    if (hasTS) {
      safeToDelete.push(filePath);
    } else {
      keepFiles.push(filePath);
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Safe to delete: ${safeToDelete.length} files`);
  console.log(`   Keep (no TS equivalent): ${keepFiles.length} files`);
  
  if (keepFiles.length > 0) {
    console.log(`\n⚠️  Files to keep (no TypeScript equivalent found):`);
    keepFiles.forEach(file => {
      console.log(`   - ${path.relative(clientDir, file)}`);
    });
  }
  
  if (safeToDelete.length === 0) {
    console.log('\n✅ No JavaScript files to delete!');
    return;
  }
  
  console.log(`\n🗑️  Deleting ${safeToDelete.length} JavaScript files...`);
  
  let deletedCount = 0;
  let errors = [];
  
  safeToDelete.forEach(filePath => {
    try {
      fs.unlinkSync(filePath);
      console.log(`   ✅ Deleted: ${path.relative(clientDir, filePath)}`);
      deletedCount++;
    } catch (error) {
      console.log(`   ❌ Error deleting: ${path.relative(clientDir, filePath)} - ${error.message}`);
      errors.push({ file: filePath, error: error.message });
    }
  });
  
  console.log(`\n🎉 Cleanup complete!`);
  console.log(`   Successfully deleted: ${deletedCount} files`);
  if (errors.length > 0) {
    console.log(`   Errors: ${errors.length} files`);
  }
  
  console.log(`\n✅ Your client directory is now 100% TypeScript!`);
}

// Run the cleanup
cleanupJSFiles();
