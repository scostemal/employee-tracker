const inquirer = require('inquirer');
require('dotenv').config();
const consoleTable = require('console.table');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const menuOptions = [
    {
        name: 'init',
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

const init = async () => {
    const userChoice = await inquirer.prompt(menuOptions);

    if (userChoice.init === 'View all departments') {
        viewDepartments();
    } else if (userChoice.init === 'View all roles') {
        viewRoles();
    } else if (userChoice.init === 'View all employees') {
        viewEmployees();
    } else if (userChoice.init === 'View employees by manager') {
        viewEmployeesByManager();
    } else if (userChoice.init === 'View employees by role') {
        viewEmployeesByRole();
    } else if (userChoice.init === 'View employees by department') {
        viewEmployeesByDepartment();
    } else if (userChoice.init === 'View budget by department') {
        viewBudgetByDepartment();
    } else if (userChoice.init === 'Add new department') {
        addDepartment();
    } else if (userChoice.init === 'Add new role') {
        addRole();
    } else if (userChoice.init === 'Add new employee') {
        addEmployee();
    } else if (userChoice.init === 'Update department') {
        updateDepartment();
    } else if (userChoice.init === 'Update role') {
        updateRole();
    } else if (userChoice.init === 'Update employee') {
        updateEmployee();
    } else if (userChoice.init === 'Delete employee') {
        deleteEmployee();
    } else if (userChoice.init === 'Delete role') {
        deleteRole();
    } else if (userChoice.init === 'Delete department') {
        deleteDepartment();
    } else {
        console.log(`Terminating connection to ${process.env.DB_NAME} and exiting the application.`);
        process.exit();
    }
}

// Defining the functions that will be executed when a user selects a menu option

const viewDepartments = async () => {
    try {
        const [rows] = await pool.query(`SELECT * FROM departments`);
        console.log(`Displaying all departments in ${process.env.DB_NAME}.`);
        console.table(rows);
        init();
    } catch (error) {
        console.error(`An error occurred: ${error}`);
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack trace: ${error.stack}`);
        init();
    }
};


const viewRoles = async () => {
    try {
        const [rows] = await pool.query('SELECT roles.id, roles.title, roles.salary, departments.name AS department_name, departments.id AS departments_id FROM roles JOIN departments ON roles.department_id = departments.id ORDER BY roles.id ASC');
        console.table(rows);
        init();
    } catch (error) {
        console.error(`An error occured: ${error}`);
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack trace: ${error.stack}`);
        init();
    }
}

const viewEmployees = async () => {
    try {
        const employeeQuery = `
        SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS departments, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name
        FROM employees
        LEFT JOIN roles ON employees.role_id = roles.id
        LEFT JOIN departments ON roles.department_id = departments.id
        LEFT JOIN employees manager ON employees.manager_id = manager.id
        `;
        const [rows] = await pool.query(employeeQuery);
        console.table(rows);
        init();
    } catch (error) {
        console.error(`An error occured: ${error}`);
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack trace: ${error.stack}`);
        init();
    }
}

async function viewEmployeesByManager() {
    try {
        const managerQuery = await pool.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employees WHERE manager_id IS NULL');
        const managerChoices = managerQuery[0].map(({ id, name }) => ({ name, value: id }));
        const userChoice = await inquirer.prompt([
            {
                type: 'list',
                name: 'managerFilter',
                message: "Choose which manager's employees you would like to view:",
                choices: managerChoices
            }
        ]);
        const employeeByManager = await pool.query(`
        SELECT e.id, e.first_name, e.last_name, r.title, d.name as department, r.salary 
        FROM employees e 
        JOIN roles r ON e.role_id = r.id 
        JOIN departments d ON r.department_id = d.id 
        WHERE e.manager_id = ?;
      `, [userChoice.managerFilter]);
        console.table(employeeByManager[0]);
        console.log(`Displaying all employees managed by ${managerChoices.find((choice) => choice.value === userChoice.managerFilter).name}.`);
        await init();
    } catch (error) {
        console.error(`An error occured: ${error}`);
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack trace: ${error.stack}`);
        await init();
    }
}

async function viewEmployeesByRole() {
    try {
        // Query database for list of roles
        const [roles] = await pool.query('SELECT id, title FROM roles');

        // Prompt user to select a role
        const { roleId } = await inquirer.prompt({
            type: 'list',
            name: 'roleId',
            message: 'Select a role:',
            choices: roles.map((role) => ({ name: role.title, value: role.id })),
        });

        // Query database for employees with selected role
        const [employees] = await pool.query(`
        SELECT e.id, e.first_name, e.last_name, r.title, d.name as department, r.salary 
        FROM employees e 
        JOIN roles r ON e.role_id = r.id 
        JOIN departments d ON r.department_id = d.id 
        WHERE r.id = ?
      `, [roleId]);

        console.table(employees);
        await init();
    } catch (error) {
        console.error(`An error occurred: ${error}`);
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack trace: ${error.stack}`);
        await init();
    }
}

async function viewEmployeesByDepartment() {
    try {
        const [rows] = await pool.query(`
            SELECT departments.name AS department, CONCAT(employees.first_name, ' ', employees.last_name) AS employee, roles.title AS title, roles.salary AS salary
            FROM employees
            INNER JOIN roles ON employees.role_id = roles.id
            INNER JOIN departments ON roles.department_id = departments.id
            ORDER BY departments.name, employees.last_name
        `);
        console.table(rows);
        init();
    } catch (error) {
        console.error(`An error occured: ${error}`);
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack trace: ${error.stack}`);
        init();
    }
}

async function viewBudgetByDepartment() {
    try {
        const [rows] = await pool.query(`SELECT departments.name, SUM(roles.salary) AS total_budget FROM departments JOIN roles ON departments.id = roles.department_id GROUP BY departments.id ORDER BY total_budget DESC;`);
        console.table(rows);
        init();
    } catch (error) {
        console.error(`An error occured: ${error}`);
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack trace: ${error.stack}`);
        init();
    }
}

const addDepartment = async () => {
    try {
        const answer = await inquirer.prompt({
            name: 'name',
            type: 'input',
            message: 'Enter the name of the new department.',
            validate: function (input) {
                if (input.trim() === '') {
                    return 'Please enter a department name.';
                }
                if (!isNaN(input)) {
                    return 'Department name should not be a number.';
                }
                if (/^[a-zA-Z\s]*$/.test(input) !== true) {
                    return 'Department name should not contain special characters.';
                }
                return true;
            }
        });
        await pool.query('INSERT INTO departments SET ?', { name: answer.name });
        console.log(`Added new department, ${answer.name} to the database`);
        init();
    } catch (error) {
        console.error(`An error occured: ${error}`);
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack trace: ${error.stack}`);
        init();
    }
}

const addRole = async () => {
    try {
        const departments = await pool.query('SELECT id, name FROM departments');
        const departmentChoices = departments[0].map(({ id, name }) => ({ name, value: id, }));
        const answers = await inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                message: 'Enter the name of the role.',
                validate: function (input) {
                    if (input.trim() === '') {
                        return 'Please enter a name for the role.';
                    }
                    if (!isNaN(input)) {
                        return 'Role name should not include numbers.';
                    }
                    if (/^[a-zA-Z\s]*$/.test(input) !== true) {
                        return 'Role name should not include special characters.';
                    }
                    return true;
                }
            },
            {
                name: 'salary',
                type: 'input',
                message: 'Enter the salary of the role.',
                validate: function (input) {
                    if (input.trim() === '') {
                        return 'Please enter a salary for the role.';
                    }
                    return true;
                }
            },
            {
                name: 'department',
                type: 'list',
                message: 'Choose the department this role belongs to.',
                choices: departmentChoices,
            },
        ]);
        await pool.query('INSERT INTO roles SET ?', {
            title: answers.title,
            salary: answers.salary,
            department_id: answers.department
        });
        console.log(`Added new role, ${answers.title} to the database.`);
        init();
    } catch (error) {
        console.error(`An error occured: ${error}`);
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack trace: ${error.stack}`);
        init();
    }
}

const addEmployee = async () => {
    try {
        const roles = await pool.query("SELECT id, title FROM roles");
        const roleChoices = roles[0].map(({ id, title }) => ({
            name: title,
            value: id,
        }));
        const managers = await pool.query(
            "SELECT id, first_name, last_name FROM employees WHERE manager_id IS NULL"
        );
        const managerChoices = managers[0].map(({ id, first_name, last_name }) => ({
            name: `${first_name} ${last_name}`,
            value: id,
        }));
        const employeeAnswers = await inquirer.prompt([
            {
                name: "firstName",
                type: "input",
                message: "Enter the first name of the new employee.",
                validate: function (input) {
                    if (input.trim() === "") {
                        return "Please enter a first name for the employee.";
                    }
                    if (!isNaN(input)) {
                        return "Employee name should not include numbers.";
                    }
                    return true;
                },
            },
            {
                name: "lastName",
                type: "input",
                message: "Enter the last name of the new employee.",
                validate: function (input) {
                    if (input.trim() === "") {
                        return "Please enter a last name for the employee.";
                    }
                    if (!isNaN(input)) {
                        return "Employee last name should not include numbers.";
                    }
                    if (/^[a-zA-Z\s]*$/.test(input) !== true) {
                        return "Employee last name should not include special characters.";
                    }
                    return true;
                },
            },
            {
                name: "role",
                type: "list",
                message: "Choose the new employee's role.",
                choices: roleChoices,
            },
        ]);

        let isManager = false;
        const managerConfirmation = await inquirer.prompt([
            {
                name: "confirm",
                type: "confirm",
                message: `Will ${employeeAnswers.firstName} be a manager?`,
            },
        ]);
        isManager = managerConfirmation.confirm;

        let managerId = null;
        if (!isManager) {
            const managerSelection = await inquirer.prompt([
                {
                    name: "manager",
                    type: "list",
                    message: "Choose the new employee's manager:",
                    choices: managerChoices,
                },
            ]);
            managerId = managerSelection.manager;
        }

        await pool.query("INSERT INTO employees SET ?", {
            first_name: employeeAnswers.firstName,
            last_name: employeeAnswers.lastName,
            role_id: employeeAnswers.role,
            manager_id: managerId,
        });

        console.log(
            `Added new employee, ${employeeAnswers.firstName} ${employeeAnswers.lastName}, to the database.`
        );
        init();
    } catch (error) {
        console.error(`An error occured: ${error}`);
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack trace: ${error.stack}`);
        init();
    }
};


async function updateEmployee() {
    try {
        const employeeQuery = await pool.query('SELECT id, first_name, last_name FROM employees');
        const employeeChoices = employeeQuery[0].map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));
        const answers1 = await inquirer.prompt([
            {
                name: 'employee',
                type: 'list',
                message: 'Choose the employee you would like to update',
                choices: employeeChoices
            },
            {
                name: 'updateType',
                type: 'list',
                message: "What would you like to update?",
                choices: ['Manager', 'Role', 'Promote']
            }
        ]);
        const employee = employeeQuery[0].find(r => r.id === answers1.employee);
        let manager;
        if (answers1.updateType === 'Manager') {
            const managerQuery = await pool.query('SELECT id, first_name, last_name FROM employees WHERE id <> ?', [answers1.employee]);
            const managerChoices = managerQuery[0].map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));
            const answers2 = await inquirer.prompt([
                {
                    name: 'manager',
                    type: 'list',
                    message: "Choose the employee's new manager",
                    choices: managerChoices
                }
            ]);
            const manager = managerQuery[0].find(r => r.id === answers2.manager);
            await pool.query('UPDATE employees SET manager_id = ? WHERE id = ?', [answers2.manager, answers1.employee]);
            console.log(`You have successfully updated ${employee.first_name} ${employee.last_name}'s manager to ${manager.first_name} ${manager.last_name} in ${process.env.DB_NAME}`);
            await init();
        } else if (answers1.updateType === 'Role') {
            const roleQuery = await pool.query('SELECT id, title FROM roles');
            const roleChoices = roleQuery[0].map(({ id, title }) => ({ name: title, value: id }));
            const answers3 = await inquirer.prompt([
                {
                    name: 'role',
                    type: 'list',
                    message: "Choose the employee's new role",
                    choices: roleChoices
                }
            ]);
            const role = roleQuery[0].find(r => r.id === answers3.role);
            await pool.query('UPDATE employees SET role_id = ? WHERE id = ?', [answers3.role, answers1.employee]);
            console.log(`You have successfully updated ${employee.first_name} ${employee.last_name}'s role to ${role.title} in ${process.env.DB_NAME}`);
            await init();
        } else if (answers1.updateType === 'Promote') {
            const { confirmPromotion } = await inquirer.prompt([
                {
                    name: 'confirmPromotion',
                    type: 'confirm',
                    message: `Promote ${employee.first_name} ${employee.last_name} to manager?`
                }
            ]);
            if (confirmPromotion) {
                await pool.query('UPDATE employees SET manager_id = NULL where id = ?', [answers1.employee]);
                console.log('Employee successfully promoted!');
                init();
            }
        }
    } catch (error) {
        console.error(`An error occured: ${error}`);
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack trace: ${error.stack}`);
        init();
    }
}

async function updateDepartment() {
    try {
        const departmentQuery = await pool.query('SELECT * FROM departments');
        const departmentChoices = departmentQuery[0].map((dept) => ({ name: dept.name, value: dept.id }));
        const { departmentUpdate } = await inquirer.prompt([
            {
                type: 'list',
                name: 'departmentUpdate',
                message: 'Choose which department you would like to update:',
                choices: departmentChoices,
            },
        ]);
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Choose what you would like to update:',
                choices: ['Update department name', 'Add new role'],
            },
        ]);
        if (action === 'Update department name') {
            let nameConfirmed = false;
            let newName;
            while (!nameConfirmed) {
                const { name } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'name',
                        message: 'Enter the new name for the department'
                    },
                ]);
                newName = name;
                const { confirmName } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirmName',
                        message: `Update department name to '${newName}?`
                    },
                ]);
                nameConfirmed = confirmName;
            }
            await pool.query('UPDATE departments SET name = ? WHERE id = ?', [newName, departmentUpdate]);
            console.log('Department name updated successfully!');
            await init();
        }
        if (action === 'Add new role') {
            const { name, salary } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'Enter the name of the new role:',
                },
                {
                    type: 'number',
                    name: 'salary',
                    message: 'Enter the salary for the new role:',
                }
            ]);
            await pool.query('INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)', [name, salary, departmentUpdate]);
            console.log('New role added successfully!');
            await init();
        }
    } catch (error) {
        console.error(`An error occurred: ${error}`);
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack trace: ${error.stack}`);
        await init();

    }
}

async function deleteEmployee() {
    try {
        const employeeQuery = await pool.query('SELECT id, first_name, last_name FROM employees');
        const employeeChoices = employeeQuery[0].map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));
        let confirmDelete = false;
        while (!confirmDelete) {
            const answer = await inquirer.prompt([
                {
                    name: 'deleteEmployee',
                    type: 'list',
                    message: 'Choose the employee you would like to delete:',
                    choices: employeeChoices
                }
            ]);

            const answerCheck = await inquirer.prompt([
                {
                    name: 'deleteEmployeeCheck',
                    type: 'confirm',
                    message: `Are you sure you would like to delete ${employeeChoices.find((choice) => choice.value === answer.deleteEmployee).name} from the ${process.env.DB_NAME}?`
                },
            ]);
            if (answerCheck.deleteEmployeeCheck) {
                await pool.query('DELETE from employees WHERE id = ?', [answer.deleteEmployee]);
                console.log(`You have successfully deleted ${employeeChoices.find((choice) => choice.value === answer.deleteEmployee).name} from ${process.env.DB_NAME}.`);
                confirmDelete = true;
                await init();
            } else {
                const returnToMainMenu = await inquirer.prompt([
                    {
                        name: 'returntoMainMenu',
                        type: 'confirm',
                        message: 'Would you like to return to the main menu?'
                    }
                ]);
                if (returnToMainMenu.returnToMainMenu) {
                    await init();
                }
            }
        }
    } catch (error) {
        console.error(`An error occured while deleting the employee: ${error}`);
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack trace; ${error.stack}`);
        console.error(`Query: DELETE from employees WHERE id = ${answer.deleteEmployee}`);
        console.error(`Database: ${process.env.DB_NAME}`);
        await init();
    }
}

async function deleteRole() {
    // setting the canDeleteRole to false to ensure the loop is entered at least once
    let selectionCount = 0;
    // adding a counter to keep track of selections
    let maxSelectionCount = 3;
    // Establishing a while loop to ensure correct user input 
    while (selectionCount < maxSelectionCount) {
        // Query the database for the id and title from the roles table and store the results in the rolesQuery constant
        const rolesQuery = await pool.query('SELECT id, title FROM roles');
        // Use the .map method and destructuring assignment to extract the id and title properties from the rolesQuery array and return a new object with the name property with assigned value title and the value property with the assigned value id. It's then assigned to roleChoices.
        const roleChoices = rolesQuery[0].map(({ id, title }) => ({ name: title, value: id }));

        // Prompting the user to choose and populating the choices with the array stored in roleChoices. storing the user input in userChoice 
        const userChoice = await inquirer.prompt([
            {
                type: 'list',
                name: 'deleteRole',
                message: 'Choose the role you would like to delete',
                choices: roleChoices
            }
        ]);
        // Check the database for the number of employees assigned to the role the user selects 
        const countQuery = 'SELECT COUNT(*) FROM employees WHERE role_id = ?';
        const [countResult] = await pool.query(countQuery, [userChoice.deleteRole]);
        const count = countResult[0]['COUNT(*)'];
        // If the count is greater than 0 the user is prompted with an error that they cannot delete that role. If there are no employees assigned to the role they will be asked to confirm their selection and if they select yes the delete query is executed
        if (count > 0) {
            console.error(`Cannot delete ${roleChoices.find((choice) => choice.value === userChoice.deleteRole).name} because there are ${count} employees stil assigned.`)
        } else {

            selectionCount++;
            if (selectionCount < maxSelectionCount) {
                const userChoiceConfirm = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'deleteRoleCheck',
                        message: `Are you sure you want to delete the role ${roleChoices.find((choice) => choice.value === userChoice.deleteRole).name} from ${process.env.DB_NAME}?`,
                        default: false,
                    },
                ]);
                if (userChoiceConfirm.deleteRoleCheck) {
                    const deleteQuery = 'DELETE FROM roles WHERE id = ?';
                    await pool.query(deleteQuery, [userChoice.deleteRole]);
                    console.log(`${roleChoices.find((choice) => choice.value === userChoice.deleteRole).name} has been deleted from ${process.env.DB_NAME}`);
                    await init();
                }
            } else {
                const returnToMainMenu = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'returnToMainMenuCheck',
                        message: 'You have made the maximum number of incorrect selections. Return to main menu?',
                        default: true,
                    },
                ]);
                if (returnToMainMenu.returnToMainMenuCheck) {
                    return;
                } else {
                    selectionCount = 0;
                }
            }

        }
    }
}

async function deleteDepartment() {
    let confirmDelete = false;
    while (!confirmDelete) {
        try {
            const departmentQuery = await pool.query('SELECT id, name FROM departments');
            const departmentChoices = departmentQuery[0].map(({ id, name }) => ({ name: name, value: id }));
            const userChoice = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'deleteDepartment',
                    message: 'Choose the department you would like to delete:',
                    choices: departmentChoices
                }
            ]);
            const departmentCountQuery = 'SELECT COUNT(*) FROM roles WHERE department_id = ?';
            const [countResult] = await pool.query(departmentCountQuery, [userChoice.deleteDepartment]);
            const count = countResult[0]['COUNT(*)'];
            if (count > 0) {
                console.error(`Cannot delete ${departmentChoices.find((choice) => choice.value === userChoice.deleteDepartment).name} because there are ${count} roles still assigned.`)
            } else {
                const confirmUserChoice = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'deleteDepartmentCheck',
                        message: `Are you sure you would like to delete ${departmentChoices.find((choice) => choice.value === userChoice.deleteDepartment).name} from ${process.env.DB_NAME}?`,
                        default: false,
                    }
                ]);
                if (confirmUserChoice.deleteDepartmentCheck) {
                    const deleteDepartmentQuery = 'DELETE FROM departments WHERE id = ?';
                    await pool.query(deleteDepartmentQuery, [userChoice.deleteDepartment]);
                    console.log(`${departmentChoices.find((choice) => choice.value === userChoice.deleteDepartment).name} has been deleted from ${process.env.DB_NAME}`);
                    confirmDelete = true;
                    await init();
                }
            }
        } catch (error) {
            console.error(`An error occurred while deleting the employee: ${error}`);
            console.error(`Error message: ${error.message}`);
            console.error(`Stack trace: ${error.stack}`);
            console.error(`Query: DELETE from departments WHERE id = ${userChoice.deleteDepartment}`);
            console.error(`Database: ${process.env.DB_NAME}`);
            await init();
        }
    }
}

init();
