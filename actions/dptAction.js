const inquirer = require('inquirer');
const mysql = require('mysql2');
const connection = require('../db/connection')


const dptAction = {
    viewDepartments: () => {
        const query = 'SELECT * FROM department';
        connection.query(query, (err, results) => {
            if(err) throw err;
            console.table(results);
            start();
        });
    },
    
    addDepartment: () => {
        inquirer
            .prompt({
                name: 'name',
                type: 'input',
                message: 'What is the name of the new department?'
            })
            .then((answer) => {
                const query = 'INSERT INTO department SET ?';
                connection.query(query, { name: answer.name }, (err) => {
                    if(err) throw err;
                    console.log(`Added new department, ${answer.name} to the database.`);
                    start();
                });
            });
    },

};

module.exports = dptAction;