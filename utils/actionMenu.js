const inquirer = require('inquirer');
// const { viewBudgetByDepartment, viewDepartments, viewEmployees, viewEmployeesByDepartment, viewEmployeesByManager, viewEmployeesByRole, viewRoles } = require('./read');
// const { addDepartment, addEmployee, addRole } = require('./create');
// const { updateDepartment, updateEmployee, updateRole } = require('./update');
const { deleteDepartment, deleteEmployee, deleteRole } = require('./delete');




const menuOptions = [
    {
        name: 'actionMenu',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'View employees by manager',
            'View employees by role',
            'View employees by department',
            'View budget by department',
            'Add new department',
            'Add new role',
            'Add new employee',
            'Update department',
            'Update role',
            'Update employee',
            'Delete department',
            'Delete role',
            'Delete employee',
            'Exit'

        ]
    }
]

async function actionMenu() {
    const userChoice = await inquirer.prompt(menuOptions);

    if (userChoice.actionMenu === 'View all departments') {
        viewDepartments();
    } else if (userChoice.actionMenu === 'View all roles') {
        viewRoles();
    } else if (userChoice.actionMenu === 'View all employees') {
        viewEmployees();
    } else if (userChoice.actionMenu === 'View employees by manager') {
        viewEmployeesByManager();
    } else if (userChoice.actionMenu === 'View employees by role') {
        viewEmployeesByRole();
    } else if (userChoice.actionMenu === 'View employees by department') {
        viewEmployeesByDepartment();
    } else if (userChoice.actionMenu === 'View budget by department') {
        viewBudgetByDepartment();
    } else if (userChoice.actionMenu === 'Add new department') {
        addDepartment();
    } else if (userChoice.actionMenu === 'Add new role') {
        addRole();
    } else if (userChoice.actionMenu === 'Add new employee') {
        addEmployee();
    } else if (userChoice.actionMenu === 'Update department') {
        updateDepartment();
    } else if (userChoice.actionMenu === 'Update role') {
        updateRole();
    } else if (userChoice.actionMenu === 'Update employee') {
        updateEmployee();
    } else if (userChoice.actionMenu === 'Delete employee') {
        deleteEmployee();
    } else if (userChoice.actionMenu === 'Delete role') {
        deleteRole();
    } else if (userChoice.actionMenu === 'Delete department') {
        deleteDepartment();
    } else {
        console.log(`Terminating connection to ${process.env.DB_NAME} and exiting the application.`);
        process.exit();
    }
}

module.exports = actionMenu;
