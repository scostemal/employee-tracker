const inquirer = require('inquirer');
const actionMenu = require('./utils/actionMenu');


async function mainMenu() {
    console.log('Initializing the application....Greetings');
    try {
       const menuOptions = await inquirer.prompt([
            {
                type: 'list',
                name: 'menuOptions',
                message: 'Welcome to the database management system. Please choose what you would like to do.',
                choices: ['Continue', 'Exit'],
                default: false,
            },
        ]);
        if (menuOptions.menuOptions === 'Continue') {
            console.log('Now displaying database interaction options');
            await actionMenu();
        } else if (menuOptions.menuOptions === 'Exit') {
            console.log('Exiting the application. Goodbye!');
            process.exit();
        }
    } catch (error) {
        console.error(`An error occured upon initialization: ${error}`);
        console.error(`Error stack trace: ${error.stack}`);
        console.error(`Error message: ${error.message}`);
        console.log('Sorry, there was an error. Contact your database administrator if it continues.');
    }
}

module.exports = mainMenu();