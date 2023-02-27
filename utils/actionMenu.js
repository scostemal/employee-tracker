const inquirer = require('inquirer');
// const { viewBudgetByDepartment, viewDepartments, viewEmployees, viewEmployeesByDepartment, viewEmployeesByManager, viewEmployeesByRole, viewRoles } = require('./read');
// const { addDepartment, addEmployee, addRole } = require('./create');
// const { updateDepartment, updateEmployee, updateRole } = require('./update');
const { deleteDepartment, deleteEmployee, deleteRole } = require('./delete');

const menuOptions = [
    {
        name: 'actionsMenu',
        type: 'list',
        message: 'Please select an option:',
        choices: [
            'Add a new department',
            'Add a new employee',
            'Add a new role',
            'Delete a department',
            'Delete a employee',
            'Delete a role',
            'Update a department',
            'Update a employee',
            'Update a role',
            'View all departments',
            'View all employees',
            'View all roles',
            'View budget by department',
            'View employees by department',
            'View employees by manager',
            'View employees by role',
            'Exit',

        ]
    }
];

const actions = {
    // 'Add a new department': addDepartment,
    // 'Add a new employee': addEmployee,
    // 'Add a new role': addRole,
    'Delete a department': deleteDepartment,
    'Delete a employee': deleteEmployee,
    'Delete a role': deleteRole,
    // 'Update a department': updateDepartment,
    // 'Update a employee': updateEmployee,
    // 'Update a role': updateRole,
    // 'View all departments': viewDepartments,
    // 'View all employees': viewEmployees,
    // 'View all roles': viewRoles,
    // 'View budget by department': viewBudgetByDepartment,
    // 'View employees by department': viewEmployeesByDepartment,
    // 'View employees by manager': viewEmployeesByManager,
    // 'View employees by role': viewEmployeesByRole,
    'Exit': () => {
        console.log(`Terminating connection to ${process.env.DB_NAME} and exiting the application. Goodbye!`);
        process.exit();
    }
};

async function actionsMenu() {
    let exit = false;
    while (!exit) {
        const { actionsMenu } = await inquirer.prompt(menuOptions);
        if (actions[actionsMenu]) {
            await actions[actionsMenu]();
        } else {
            console.log('Returning to the main menu...');
        }
        if (actionsMenu === 'Exit') {
            console.log(`Terminating connection to ${process.env.DB_NAME} and exiting the application`);
            exit = true;
        }
    }
}

module.exports = actionsMenu;
