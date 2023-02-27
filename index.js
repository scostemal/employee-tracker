const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
require('dotenv').config(); 

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});



const firstPrompt = [
  {
    type: "list",
    name: "start",
    message:
      "What would you like to do?",
    choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Delete an employee", "Update employee", "Exit"]
  }
]

const start = async () => {
    try {
        const answer = await inquirer.prompt(firstPrompt);
        if (answer.start === "View all departments") {
            allDepartments();
          } else if (answer.start === "View all roles") {
            allRoles();
          } else if (answer.start === "View all employees") {
            allEmployees();
          } else if (answer.start === "Add a department") {
            addDepartment();
          } else if (answer.start === "Add a role") {
            addRole();
          } else if (answer.start === "Add an employee") {
            addEmployee();
          } else if (answer.start === "Update an employee role") {
            updateEmployee();
          } else if (answer.start === "Delete an employee") {
            deleteEmployee();
          } else if (answer.start === "Delete a role") {
            deleteRole();
          } else if (answer.start === "Delete a department") {
            deleteDepartment();
          } else if  (answer.start === "Exit") {
            console.log("Exiting the application");
            process.exit();
            }
    }   catch (error) {
            console.error(`Error message: ${error.message}`);
            console.error(`Error stack trace: ${error.stack}`);
            console.error(`Error: ${error}`)
            await start();
        }
}

async function allDepartments() {
    try {
        const [ departmentsQuery ] = await db.query('SELECT id, name AS department_name FROM departments');
        console.table(departmentsQuery)
        await start();
    } catch (error) {
        console.log('There was an error retreiving the data. Please contact your database administrator if it continues');
        console.log('Returning you to the main menu.');
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack trace: ${error.stack}`);
        await start();
    }
}

async function allRoles() {
    try {
        const [ rolesQuery ] = await db.query( 'SELECT roles.title, roles.id AS role_id, departments.name as department, roles.salary FROM roles JOIN departments ON roles.department_id = departments.id');
        console.table(rolesQuery)
        await start();
    } catch (error) {
        console.log('There was an error retrieving the data. Please contact your database administrator if it continues');
        console.log('Returning you to the main menu.')
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack trace: ${error.stack}`);
        await start();
    }
}

async function allEmployees() {
    try {
        const [ employeesQuery ] = await db.query('SELECT employees.id AS id, CONCAT(employees.first_name, " ", employees.last_name) AS employee_name, roles.title, departments.name AS department, roles.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager_name FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id LEFT JOIN employees manager ON employees.manager_id = manager.id');
        console.table(employeesQuery);
        await start();
    } catch (error) {
        console.error('There was an error. If it continues to happen, please contact your database administrator');
        console.error('Returning you to the main menu.');
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack trace: ${error.stack}`);
        console.error(`Error: ${error}`);
        await start();
    }
}

async function addDepartment() {
    try {
        const departmentName = await inquirer.prompt([
            {
                type: 'input',
                name: 'userInputName',
                message: "Enter the new department's name."
            }
        ]);
        const [ addNameToDatabase ] = await db.query('INSERT INTO departments (name) VALUES (?)', [departmentName.userInputName]);
        console.log(`Added new department, "${departmentName.userInputName}", to the database`);
        await start();
    } catch (error) {
        console.log('An error occurred. Please contact your database administrator if it continues.');
        console.log('Returning you to the main menu.');
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack trace: ${error.stack}`);
        console.error(`Error: ${error}`);
        await start();
    }
}

async function addRole() {
    try {
        const [ departmentChoicesQuery ] = await db.query('SELECT * FROM departments');
        const departmentChoices = departmentChoicesQuery.map(dept => ({ value: dept.id, name: dept.name }));
        const newRole  = await inquirer.prompt([
            {
                type: 'input',
                name: 'deptNameUser',
                message: 'Enter the name of this role:',
            },
            {
                type: 'input',
                name: 'deptSalaryUser',
                message: 'Enter the salary for this role:'
            },
            {
                type: 'list',
                name: 'deptChoiceUser',
                message: 'Select the department this role belongs to:',
                choices: departmentChoices
            },
        ]);

        const [ addNewRoleQuery ] = await db.query('INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)', [newRole.deptNameUser, newRole.deptSalaryUser, newRole.deptChoiceUser]);
        console.log(`Added new role "${newRole.deptNameUser}" to the database.`);
        await start();
    } catch (error) {
        console.log('An error occurred. Please contact your database administrator if it continues.');
        console.log('Returning you to the main menu.');
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack trace: ${error.stack}`);
        console.error(`Error: ${error}`);
        await start();
    }
}

async function addEmployee() {
    try {
        const [ rolesQuery ] = await db.query('SELECT * FROM roles');
        const [ managersQuery ] = await db.query('SELECT * FROM employees WHERE manager_id IS NULL');
        const roleChoices = rolesQuery.map(roles => ({ name: roles.title, value: roles.id}));
        const managerChoices = managersQuery.map(managers => ({ name: `${managers.first_name} ${managers.last_name}`, value: managers.id}));
        const newEmployee = await inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'Enter the first name of the new employee:',
            },
            {
                type: 'input',
                name: 'lastName',
                message: 'Enter the last name of the employee:',
            },
            {
                type: 'list',
                name: 'role',
                message: 'Choose a role for this new employee:',
                choices: roleChoices
            },
            {
                type: 'list',
                name: 'manager',
                message: 'Choose the manager for this employee:',
                choices: managerChoices
            }
        ]);
        const selectedRole = roleChoices.find(role => role.value === newEmployee.role).name;
        const selectedManager = managerChoices.find(manager => manager.value === newEmployee.manager).name;

        await db.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [newEmployee.firstName, newEmployee.lastName, newEmployee.role, newEmployee.manager]);
        console.log(`New employee, "${newEmployee.firstName} ${newEmployee.lastName}" being managed by "${selectedManager}", working as a "${selectedRole}" has been added to the database.`);
        await start();

    } catch (error) {
        console.error('An erro has occured. Please contact your database administrator if it continues.');
        console.error('Returning you to the main menu...');
        console.error(`An error occurred: ${error.message}`);
        console.error(`Error stack trace: ${error.stack}`);
        console.error(`Error: ${error}`);
        await start();
    }
} ;

async function updateEmployee() {
    try { 
        const [ rolesQuery ] = await db.query('SELECT * FROM roles');
        const [ managersQuery ] = await db.query('SELECT * FROM employees WHERE manager_id IS NULL');
        const roleChoices = rolesQuery.map(roles => ({ name: roles.title, value: roles.id}));
        const managerChoices = managersQuery.map(managers => ({ name: `${managers.first_name} ${managers.last_name}`, value: managers.id}));
        const [ employeesQuery ] = await db.query('SELECT * FROM employees');
        const employeeChoices = employeesQuery.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id}));
        const [ updateEmployee ] = await inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: 'Choose the employee you would like to update',
                choices: employeeChoices
            },
            {
                type: 'list',
                name: 'updateOptions',
                message: 'Choose what you would like to update:',
                choices: ['Employee name', 'Employee role', 'Employee manager', 'Main menu']
            }
        ]);
        if (updateEmployee.updateOptions === 'Employee name') {
            const newName = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: 'Enter the new first name:',
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: 'Enter the new last name:',
                }
            ]);
            await db.query('UPDATE employees SET first_name = ?, last_name = ?, WHERE id = ?', [updateEmployee.firstName, updateEmployee.lastName]);
            console.log(`Successfully updated the employee name to "${updateEmployee.firstName} ${updateEmployee.lastName}" in the database.`);
            } else if (updateEmployee.updateOptions === 'Employee role') {
               const newRole = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: 'Choose the new role:',
                        choices: roleChoices
                    }
                ]);
                await db.query('UPDATE employees SET role_id = ? WHERE id = ?', [updateEmployee.role]);
            } else if (updateEmployee.updateOptions === 'Employee manager') {
                const newManager = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'manager',
                        message: 'Choose the new manager:',
                        choices: managerChoices
                    }
                ]);
                await db.query('UPDATE employees SET manger_id = ? WHERE id = ?', [updateEmployee.manager]);
            } else {
                console.log('Returning to main menu...');
                await start();
            }
    } catch (error) {
            console.log('An error occured. Please contact your system administrator if it continues');
            console.error(`Error message: ${error.message}`);
            console.error(`Error stack trace: ${error.stack}`);
            await start();
    }
} 

start();

