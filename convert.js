#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const csv = require('csv-parser');

function formatInputsAsYaml(data, selectedKeys) {
    if (!Array.isArray(data)) throw new TypeError('expected an array');

    return data.map((item, i) => {
        let yaml = `input${i}:`;
        selectedKeys.forEach(key => {
            let value = item && item[key] ? String(item[key]).trim() : '';
            // Remove leading quote if exists
            if (value.startsWith('"') || value.startsWith("'")) {
                value = value.slice(1);
            }
            // Remove trailing quote if exists
            if (value.endsWith('"') || value.endsWith("'")) {
                value = value.slice(0, -1);
            }
            // Escape backslashes first, then escape quotes
            value = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            // Properly quote YAML string values to preserve structure
            const quotedValue = `"${value}"`;
            yaml += `\n  ${key}: ${quotedValue}`;
        });
        return yaml;
    }).join('\n');


    function prompt(rl, question, defaultValue) {
        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                resolve(answer.trim() || defaultValue);
            });
        });
    }

    function getAllKeys(data) {
        const keysSet = new Set();
        data.forEach(item => {
            Object.keys(item).forEach(key => keysSet.add(key));
        });
        return Array.from(keysSet);
    }

    async function selectKeys(rl, allKeys) {
        const selectedKeys = new Set(allKeys); // All keys checked by default
        let currentIndex = 0;

        const displayMenu = () => {
            console.clear();
            console.log('Select keys to include (use arrow keys, SPACE to toggle, ENTER to confirm):\n');
            allKeys.forEach((key, index) => {
                const isSelected = selectedKeys.has(key);
                const checkbox = isSelected ? '☑' : '☐';
                const marker = index === currentIndex ? '> ' : '  ';
                console.log(`${marker}${checkbox} ${key}`);
            });
        };

        return new Promise((resolve) => {
            displayMenu();

            const onKeyPress = (str, key) => {
                if (key.name === 'up') {
                    currentIndex = (currentIndex - 1 + allKeys.length) % allKeys.length;
                    displayMenu();
                } else if (key.name === 'down') {
                    currentIndex = (currentIndex + 1) % allKeys.length;
                    displayMenu();
                } else if (key.name === 'space') {
                    const currentKey = allKeys[currentIndex];
                    if (selectedKeys.has(currentKey)) {
                        selectedKeys.delete(currentKey);
                    } else {
                        selectedKeys.add(currentKey);
                    }
                    displayMenu();
                } else if (key.name === 'return') {
                    resolve(Array.from(selectedKeys));
                }
            };

            readline.emitKeypressEvents(process.stdin);
            if (process.stdin.isTTY) process.stdin.setRawMode(true);
            process.stdin.on('keypress', onKeyPress);
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
            .on('end', async () => {
                const allKeys = getAllKeys(results);

                if (allKeys.length === 0) {
                    console.error('No keys found in CSV file');
                    process.exitCode = 1;
                    return;
                }

                const rl2 = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                const selectedKeys = await selectKeys(rl2, allKeys);
                rl2.close();

                if (process.stdin.isTTY) process.stdin.setRawMode(false);
                process.stdin.removeAllListeners('keypress');

                if (selectedKeys.length === 0) {
                    console.error('No keys selected');
                    process.exitCode = 1;
                    return;
                }

                const yamlOutput = formatInputsAsYaml(results, selectedKeys);

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

    module.exports = { formatInputsAsYaml, getAllKeys };

    if (require.main === module) main();
}
