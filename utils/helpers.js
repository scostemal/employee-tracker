const inquirer = require('inquirer');
const actionMenu = require('./actionMenu');
const mainMenu = require('../mainMenu');

async function userActionCheck() {
    try{
        const { actionCheck } = await inquirer.prompt([
            {
                type: 'list',
                name: 'actionCheck',
                message: 'Are you sure you want to take this action?',
                choices: [ 'Yes', 'No' ],
                default: false,
            },
        ]);

        if (actionCheck === 'Yes') {
            return true;
        } else {
            console.log('Returning you to the main menu....');
            await actionMenu();
            return 'back';
        }
    } catch (error) {
        console.error(`An error occured during initialization of a menu option: ${error}`);
        console.error(`Error stack trace: ${error.stack}`);
        console.log('An error has occurred. You have been brought to the main menu in the mean time. If it continues to happen, please contact your database administrator.');
        await mainMenu();
    }
}

module.exports = userActionCheck;