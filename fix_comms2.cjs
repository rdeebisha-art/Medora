const fs = require('fs');
let content = fs.readFileSync('src/services/communicationService.ts', 'utf8');

content = content.replace(
  "status: isDemo ? 'DELIVERED' : (params.isOffline ? 'WAITING_FOR_NETWORK' : 'QUEUED')",
  "status: isDemo ? 'DELIVERED' : 'QUEUED'"
);

fs.writeFileSync('src/services/communicationService.ts', content, 'utf8');
