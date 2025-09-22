// Script to help debug content collection issues
const fs = require('fs');
const path = require('path');

// Function to log papers and their content
function logPapersContent() {
  const papersDir = path.join(__dirname, '../src/content/papers');
  
  try {
    const files = fs.readdirSync(papersDir);
    console.log(`Found ${files.length} files in papers directory`);
    
    files.forEach(file => {
      if (file.endsWith('.mdx') || file.endsWith('.md')) {
        try {
          const filePath = path.join(papersDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          console.log(`\n----- ${file} -----`);
          console.log(content.substring(0, 500) + '...'); // Show first 500 chars
          
          // Extract frontmatter to check for required fields
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            console.log('\nChecking required fields:');
            console.log('- title:', frontmatter.includes('title:'));
            console.log('- authors:', frontmatter.includes('authors:'));
          }
        } catch (error) {
          console.error(`Error reading file ${file}:`, error);
        }
      }
    });
  } catch (error) {
    console.error('Error reading papers directory:', error);
  }
}

logPapersContent();
