const fs = require('fs');

async function fetchPage(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    // Simple markdown-ish text extractor or strip html tags
    let cleaned = text
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned;
  } catch (err) {
    return 'Error: ' + err.message;
  }
}

async function run() {
  const urls = {
    l1: 'https://cyber-security-b.pages.dev/lesson1.html',
    l2: 'https://cyber-security-b.pages.dev/lesson2.html',
    l3: 'https://cyber-security-b.pages.dev/lesson3.html',
    l4: 'https://cyber-security-b.pages.dev/lesson4.html',
    ca: 'https://cyber-security-b.pages.dev/ca.html',
    exam: 'https://cyber-security-b.pages.dev/final-exam.html'
  };
  
  for (const [key, url] of Object.entries(urls)) {
    console.log(`=== Fetching ${key}: ${url} ===`);
    const content = await fetchPage(url);
    console.log(content.substring(0, 3000)); // print first 3000 chars
    fs.writeFileSync(`${key}_content.txt`, content);
  }
}

run();
