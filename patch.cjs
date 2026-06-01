const fs = require('fs');
let content = fs.readFileSync('src/views/Courses.tsx', 'utf8');

// Replace '{module.order}' inside the circle wrapper of modern isLocked styles
content = content.replace(/className=\{cn\([\s\S]*?bg-slate-100 border-slate-200[\s\S]*?\)\}[\s\S]*?\{\s*module\.order\s*\}/g, (match) => {
  return match.replace(/\{\s*module\.order\s*\}/, '{isLocked ? <Lock className="w-4 h-4 text-slate-450" /> : (isPassed ? <CheckCircle className="w-4 h-4 text-white" /> : module.order)}');
});

fs.writeFileSync('src/views/Courses.tsx', content, 'utf8');
console.log("Dynamic bubble patch applied successfully!");
