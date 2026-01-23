const { generateAndSendReport } = require('./cronService');

console.log('Manually triggering report generation...');
generateAndSendReport()
    .then(() => console.log('Manual trigger initiated.'))
    .catch(err => console.error('Manual trigger failed:', err));
