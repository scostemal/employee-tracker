const inquirer = require('inquirer');
const mysql = require('mysql2');
const actions = require('./index');

function start() {
    const choices = [    
    'View all departments',
    'View all roles',
    'View all employees',
    'Add a department',
    'Add a role',
    'Add an employee',
    'Update an employee role',
    'Exit'
];
  
    inquirer
      .prompt([
        {
          name: 'selectedAction',
          type: 'list',
          message: 'What would you like to do?',
          choices: choices
        }
      ])
      .then((answer) => {
        const selectedActionIndex = choices.indexOf(answer.selectedAction);
  
        if (selectedActionIndex === 0) {
          actions.viewDepartments();
        } else if (selectedActionIndex === 1) {
          actions.viewRoles();
        } else if (selectedActionIndex === 2) {
          actions.viewEmployees();
        } else if (selectedActionIndex === 3) {
          actions.addDepartment();
        } else if (selectedActionIndex === 4) {
          actions.addRole();
        } else if (selectedActionIndex === 5) {
          actions.addEmployee();
        } else if (selectedActionIndex === 6) {
          actions.updateEmployee();
        } else if (selectedActionIndex === 7) {
          connection.end();
        }
      });
  }

  module.exports = { start };