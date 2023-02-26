const inquirer = require('inquirer');
const actionMenu = require('./actionMenu');
const userActionCheck = require('./helpers');
const { pool } = require('../db/db');


async function deleteDepartment() {
    // Initializing a try/catch block for error handling.
    try {
        const checkAction = await userActionCheck('Are you sure you want to perform this action?');

        if (!checkAction) {
            console.log('Returning to main menu...');
            await actionMenu();
        } else if (checkAction) {

            let confirmDelete = false;
            while(!confirmDelete) {
                // Query the database and map those results to us in the prompt choices
                const departmentQuery = await pool.query('SELECT id, name FROM departments');
                const departmentChoices = departmentQuery[0].map(({ id, name }) => ({ name: name, value: id }));
                const deleteDepartmentChoice = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'deleteDepartmentChoice',
                        message: 'Choose the department you would like to delete:',
                        choices: departmentChoices
                    }
                ]);
                // Query the database to count if roles are still assigned to the department and error the delete if there are roles still assigned
                const departmentRoleCheck = 'SELECT COUNT(*) FROM roles WHERE department_id = ?';
                const [countResult] = await pool.query(departmentRoleCheck, [deleteDepartmentChoice.deleteDepartmentChoice]);
                const count = countResult[0]['COUNT(*)'];
                if (count > 0) {
                    console.error(`Cannot delete "${departmentChoices.find((choice) => choice.value === deleteDepartmentChoice.deleteDepartmentChoice).name}" because there are ${count} roles still assigned. Remove assigned roles before department can be deleted.`);
                    const chooseAnotherDepartment = await inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'chooseAnotherDepartment',
                            message: 'Would you like to choose another department to delete?',
                            default: false,
                        },
                    ]);
                    if (!chooseAnotherDepartment.chooseAnotherDepartment) {
                        console.log('Returning to main menu...');
                        await actionMenu();
                        return;
                    }
                } else {
                    const confirmDeleteDepartmentChoice = await inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'confirmDeleteDepartmentChoice',
                            message: `Are you certain you would like to delete ${departmentChoices.find((choice) => choice.value ===  deleteDepartmentChoice.deleteDepartmentChoice).name}?`,
                            default: false,
                        },
                    ]);
                    // Query the database and delete the department
                    if (confirmDeleteDepartmentChoice.confirmDeleteDepartmentChoice) {
                        const deleteDepartmentQuery = 'DELETE FROM departments WHERE id = ?';
                        await pool.query(deleteDepartmentQuery, [deleteDepartmentChoice.deleteDepartmentChoice]);
                        console.log(`${departmentChoices.find((choice) => choice.value === deleteDepartmentChoice.deleteDepartmentChoice).name} has been deleted from the database.`);
                        confirmDelete = true;
                        await actionMenu();
                    }
                }
            }
        }
    } catch (error) {
        console.error(`An error occurred while deleting the department:: ${error}`);
        console.error(`Error message: ${error.message}`);
        console.error(`Stack trace: ${error.stack}`);
        console.error(`Database: ${process.env.DB_NAME}`);
        await actionMenu();
    }
}

async function deleteEmployee() {
    console.log('Just checking... :)')
    try {
        const checkAction = userActionCheck('Are you sure you want to perform this action?');

        if (!checkAction) {
            console.log('Returning to main menu...');
            await actionMenu();
        } else if (checkAction) {
            try {
                const employeeQuery = await pool.query('SELECT id, first_name, last_name, manager_id FROM employees');
                const employeeChoices = employeeQuery[0].map(({ id, first_name, last_name, manager_id }) => ({ name: `${first_name} ${last_name}`, value: id }));
            } catch (error) {
                console.error(`An error occured while trying to query the database: ${error}`);
                console.error("Query: 'SELECT id, first_name, last_name, manager_id FROM employees'");
                console.error(`Error message: ${error.message}`);
                console.error(`Error stack trace: ${error.stack}`);
                await actionMenu();
            }
            let deleteConfirm = false;
            while (!deleteConfirm) {
                const { deleteEmployeeChoice } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'deleteEmployeeChoice',
                        message: 'Choose an employee to delete:',
                        choices: employeeChoices,
                    },
                ]);
                console.log(deleteEmployeeChoice)
                const { name } = employeeChoices.find((employee) => employee.value === deleteEmployeeChoice);
                const confirmDeletion = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirmDeletion',
                        message: `Are you sure you want to delete the employee "${name}" from the database?`,
                        default: false,
                    },
                ]);

                if (confirmDeletion.confirmDeletion) {
                    try {
                        await pool.query('DELETE FROM employees WHERE id = ?', [deleteEmployeeChoice]);
                        console.log(`${name} has been deleted from the database.`);
                    } catch (error) {
                        console.error(`An error occured while deleting ${name} from the database.`);
                        console.error("Query: 'DELETE FROM employees WHERE id =?'")
                        console.error(`Error message: ${error.message}.`);
                        console.error(`Stack trace: ${error.stack}`);
                        await actionMenu();
                    }
                }
                const { chooseAnotherEmployeeToDelete } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'chooseAnotherEmployeeToDelete',
                        message: 'Would you like to choose another employee to delete?',
                        default: false,
                    },
                ]);
                if (chooseAnotherEmployeeToDelete.chooseAnotherEmployeeToDelete) {
                    console.log('Returning to main menu...');
                    deleteConfirm = true;
                    await actionMenu();
                }
            }
        } 

    } catch (error) {
        console.error(`An error occured during the delete employee process: ${error}`);
        console.log("Sorry for the inconvenience, but I'm returning to the main menu...there's been a technical difficulty. Contact your database administrator if it continues.");
        await actionMenu();
            
    }
}

async function deleteRole() {
    console.log('Just checking...for your sanity :)')
    try {
        let roleChoices;
        const checkAction = userActionCheck('Are you sure you want to perform this action?');

        if (!checkAction) {
            console.log('Returning to main menu...');
            await actionMenu();
        } else if (checkAction) {
            try {
                const roleQuery = await pool.query('SELECT id, title FROM roles');
                const roleChoices = roleQuery[0].map(({ id, title }) => ({ name: title, value: id }));
            } catch (error) {
                console.error(`An error occured while trying to query the database: ${error}`);
                console.error("QUERY:'SELECT id, title FROM roles'");
                console.error(`Error stack trace: ${error.stack}`);
                console.log('Returning you to the main menu...There was an error. Contact your database administrator if it continues.')
                await actionMenu();
            }
            let deleteConfirm = false;
            while (!deleteConfirm) {
                const { deleteRoleChoice } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'deleteRoleChoice',
                        message: 'Choose a role to delete',
                        choices: roleChoices,
                    },
                ]);
                console.log(deleteRoleChoice)
                const { name } = roleChoices.find((role) => role.value === deleteRoleChoice);
                try {
                    employeesAssignedQuery = 'SELECT COUNT(*) FROM employees WHERE role_id = ?';
                    const [countResult] = await pool.query(employeesAssignedQuery, [])
                    const count = countResult[0]['COUNT(*)'];
                    if (count > 0) {
                        console.error(`Cannot delete the "${deleteRoleChoice}" because there are ${count} employees assigned.`);
                    }
                } catch (error) {
                    console.error(`An error occured while trying to query the database: ${error}`);
                    console.error("QUERY: 'SELECT COUNT(*) FROM employees WHERE role_id =?'");
                    console.error(`Error stack trace: ${error.stack}`);
                    console.log("There's been a mix-up. Contact your database administrator if it continues. Enjoy the main menu - have a look around.");
                    await actionMenu();
                } 
                const confirmDeletion = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirmDeletion',
                        message: `Are you sure you want to delete the role "${name}" from the database?`,
                        default: false,
                    },
                ]);

                if (confirmDeletion.confirmDeletion) {
                    try {
                        await pool.query('DELETE FROM employees WHERE id = ?', [deleteRoleChoice]);
                        console.log(`${name} has been deleted from the database.`)
                    } catch (error) {
                        console.error(`An error occured while trying to delete: ${error}`);
                        console.error("QUERY: 'DELETE FROM employees WHERE id = ?', [deleteRoleChoice]");
                        console.error(`Error stack trace: ${error.stack}`);
                        console.log("Pardon me! Something went wrong. Contact your database administrator if it continues.")
                        await actionMenu();
                    }
                }
                const { chooseAnotherRoleToDelete } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'chooseAnotherRoleToDelete',
                        message: 'Would you like to choose another role to delete?',
                        default: false,
                    },
                ]);
                if (chooseAnotherRoleToDelete.chooseAnotherRoleToDelete) {
                    console.log('Returning to main menu...');
                    deleteConfirm = true;
                    await actionMenu();
                }
            }
        }
    } catch (error) {
        console.error(`An error occured while trying to perform this action: ${error}`);
        console.error(`QUERY: Accessing delete role menu `);
        console.error(`Error stack trace: ${error.stack}`);
        console.log("Sorry for the inconvenience, but I'm returning to the main menu...there's been a technical difficulty. Contact your database administrator if it continues.")
        await actionMenu();
    }
}

module.exports = { deleteDepartment, deleteEmployee, deleteRole }