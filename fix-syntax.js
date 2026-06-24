const fs = require('fs');
const file = 'C:/DEVKiTZ/01_PROJECTS/01_dashboard/shared/dkz-hyperreal-bg.js';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync(file, c);
