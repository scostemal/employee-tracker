const inquirer = require('inquirer');
const mysql = require('mysql2');
const connection = require('../db/connection')

roleAction = {
    viewRoles: () => {
        const query = 'SELECT * FROM role';
        connection.query(query, (err, results) => {
            if(err) throw err;
            console.table(results);
            start();
        });
    },

    addRole: () => {
        const departmentQuery = 'SELECT id, name FROM department';
        connection.query(departmentQuery, (err, results) => {
            if(err) throw err;
            const departmentChoices = results.map(({ id, name }) => ({ name, value: id }));
            inquirer
                .prompt([
                    {
                        name: 'title',
                        type: 'input',
                        message: 'What is the title of the new role?'
                    },
                    {
                        name: 'salary',
                        type: 'input',
                        message: 'What is the salary of this role?'
                    },
                    {
                        name: 'department',
                        type: 'list',
                        message: 'Which department does this role belong to?',
                        choices: departmentChoices
                    }
                ])
                .then((answers) => {
                    const query = 'INSERT INTO role SET ?';
                    connection.query(query, { title: answers.title, salary: answers.salary, department_id: answers.department }, (err) => {
                        if(err) throw err;
                        console.log(`Added new role, ${answers.title} to the database.`);
                        start();
                    });
                });
        });
    },
};

module.exports = roleAction;

