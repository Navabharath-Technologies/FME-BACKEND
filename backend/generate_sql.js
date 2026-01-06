const fs = require('fs');
const questions = require('./questions_data');

let sql = `USE FME_Unified_DB;
GO

-- Clear existing data
TRUNCATE TABLE [ZED_MCQ_DB].[questions];
GO

-- Enable Identity Insert to keep IDs sync
SET IDENTITY_INSERT [FME_Unified_DB].[ZED_MCQ_DB].[questions] ON;

INSERT INTO [ZED_MCQ_DB].[questions] (id, question_text, option_a, option_b, option_c, option_d, option_e, correct_answer) VALUES
`;

const escape = (str) => str ? `'${str.replace(/'/g, "''")}'` : 'NULL';

const values = questions.map(q => {
    return `(${q.id}, ${escape(q.question)}, ${escape(q.options.A)}, ${escape(q.options.B)}, ${escape(q.options.C)}, ${escape(q.options.D)}, ${escape(q.options.E)}, ${escape(q.answer)})`;
}).join(',\n');

sql += values + ';\n\nSET IDENTITY_INSERT [FME_Unified_DB].[ZED_MCQ_DB].[questions] OFF;\nGO\n';

fs.writeFileSync('insert_questions.sql', sql);
console.log('Successfully created insert_questions.sql');
