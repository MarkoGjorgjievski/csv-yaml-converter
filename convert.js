#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const csv = require('csv-parser');

function formatInputsAsYaml(data) {
    if (!Array.isArray(data)) throw new TypeError('expected an array');

    return data.map((item, i) => {
        const url = item && item.url ? item.url : '';
        return `input${i}:\n  url: ${url}`;
    }).join('\n');
}

function prompt(rl, question, defaultValue) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim() || defaultValue);
        });
    });
}

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const inputFilename = await prompt(rl, 'Input CSV file (default: customdata.csv): ', 'customdata.csv');
    const outputFilename = await prompt(rl, 'Output YAML file (default: inputs.yaml): ', 'inputs.yaml');
    rl.close();

    const inputFile = path.join(__dirname, inputFilename);
    const outputFile = path.join(__dirname, outputFilename);

    const results = [];

    fs.createReadStream(inputFile)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            const yamlOutput = formatInputsAsYaml(results);

            try {
                fs.writeFileSync(outputFile, yamlOutput, 'utf8');
                console.log(`✓ Generated ${outputFile}`);
            } catch (err) {
                console.error('Failed to write YAML file:', err.message);
                process.exitCode = 1;
            }
        })
        .on('error', (err) => {
            console.error('Failed to read CSV file:', err.message);
            process.exitCode = 1;
        });
}

module.exports = { formatInputsAsYaml };

if (require.main === module) main();

