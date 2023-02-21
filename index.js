// Importing the dependencies

const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const { start } = require('./app');

const connection = require('./db/connection');
const dptAction = require('./actions/dptAction');
const empAction = require('./actions/empAction');
const roleAction = require('./actions/roleAction');



const actions = {
    viewDepartments: dptAction.viewDepartments,
    viewRoles: roleAction.viewRoles,
    viewEmployees: empAction.viewEmployees,
    addDepartment: dptAction.addDepartment,
    addRole: roleAction.addRole,
    addEmployee: empAction.addEmployee,
    updateEmployee: empAction.updateEmployee
};

module.exports = actions;

start(actions);
 















//     (start) => {
//         const query = 'SELECT * FROM department';
//         connection.query(query, (err, results) => {
//             if(err) throw err;
//             console.table(results);
//             start();
//         });
//     },

//     viewRoles: (start) => {
//         const query = 'SELECT * FROM role';
//         connection.query(query, (err, results) => {
//             if(err) throw err;
//             console.table(results);
//             start();
//         });
//     },

//     viewEmployees: (start) => {
//         const query = `
//         SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
//         FROM employee
//         LEFT JOIN role ON employee.role_id = role.id
//         LEFT JOIN department ON role.department_id = department.id
//         LEFT JOIN employee manager ON employee.manager_id = manager.id
//         `;
//         connection.query(query, (err, results) => {
//             if(err) throw err;
//             console.table(results);
//             start();
//         });
//     },

//     addDepartment: (start) => {
//         inquirer
//             .prompt({
//                 name: 'name',
//                 type: 'input',
//                 message: 'What is the name of the new department?'
//             })
//             .then((answer) => {
//                 const query = 'INSERT INTO department SET ?';
//                 connection.query(query, { name: answer.name }, (err) => {
//                     if(err) throw err;
//                     console.log(`Added new department, ${answer.name} to the database.`);
//                     start();
//                 });
//             });
//     },

//     addRole: (start) => {
//         const departmentQuery = 'SELECT id, name FROM department';
//         connection.query(departmentQuery, (err, results) => {
//             if(err) throw err;
//             const departmentChoices = results.map(({ id, name }) => ({ name, value: id }));
//             inquirer
//                 .prompt([
//                     {
//                         name: 'title',
//                         type: 'input',
//                         message: 'What is the title of the new role?'
//                     },
//                     {
//                         name: 'salary',
//                         type: 'input',
//                         message: 'What is the salary of this role?'
//                     },
//                     {
//                         name: 'department',
//                         type: 'list',
//                         message: 'Which department does this role belong to?',
//                         choices: departmentChoices
//                     }
//                 ])
//                 .then((answers) => {
//                     const query = 'INSERT INTO role SET ?';
//                     connection.query(query, { title: answers.title, salary: answers.salary, department_id: answers.department }, (err) => {
//                         if(err) throw err;
//                         console.log(`Added new role, ${answers.title} to the database.`);
//                         start();
//                     });
//                 });
//         });
//     },

//     addEmployee: (start) => {
//         const roleQuery = 'SELECT id, title FROM role';
//         connection.query(roleQuery, (err, results) => {
//             if(err) throw err;
//             const roleChoices = results.map(({ id, title }) => ({ name: title, value: id }));
//             inquirer
//                 .prompt([
//                     {
//                         name: 'firstName',
//                         type: 'input',
//                         message: "What is the employee's first name?"
//                     },
//                     {
//                         name: 'lastName',
//                         type: 'input',
//                         message: "What is the employee's last name?"
//                     },
//                     {
//                         name: 'role',
//                         type: 'list',
//                         message: "What is the employee's role?",
//                         choices: roleChoices
//                     },
//                     {
//                         name: 'manager',
//                         type: 'input',
//                         message: "Who is the employee's manager? (Enter manager's id)"
//                     }

//                 ])
//                 .then((answers) => {
//                     const query = 'INSERT INTO employee SET ?';
//                     connection.query(query, {
//                         first_name: answers.firstName,
//                         last_name: answers.lastName,
//                         role_id: answers.role,
//                         manager_id: answers.manager
//                     }, (err) => {
//                         if(err) throw err;
//                         console.log(`Added new employee, ${answers.firstName} ${answers.lastName}, to the database.`);
//                         start();
//                     });
//                 });
//         });
//     },

//     updateEmployee: (start) => {
//         const employeeQuery = 'SELECT id, first_name, last_name FROM employee';
//         connection.query(employeeQuery, (err, results) => {
//             if(err) throw err;
//             const employeeChoices = results.map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name }`, value: id }));
//             const roleQuery = 'SELECT id, title FROM role';
//             connection.query(roleQuery, (err, results) => {
//                 if(err) throw err;
//                 const roleChoices = results.map(({ id, title }) => ({ name: title, value: id }));
//                 inquirer
//                     .prompt([
//                         {
//                             name: 'employee',
//                             type: 'list',
//                             message: "Which employee's role would you like to update?",
//                             choices: employeeChoices
//                         }
//                     ])
//                     .then((answers) => {
//                         const query = 'UPDATE employee SET ? WHERE ?';
//                         connection.query(query, [{ role_id: answers.role }, { id: answers.employee }], (err) => {
//                             if(err) throw err;
//                             console.log(`Employee's role updated in the database.`);
//                             start();
//                         });
//                     });

//             });
//         });
//     },

//     exit: (start) => {
//         console.log(`Goodbye!`);
//         connection.end();
//         process.exit();
//     }
// };

// module.exports = actions;

// start();
