USE company_db;

-- Adding Departments
INSERT INTO department (name) 
VALUES
    ('Engineering'),
    ('Sales'),
    ('Finance'),
    ('Marketing');

-- Adding Roles
INSERT INTO role (title, salary, department_id) 
VALUES
    ('Sales Lead', 100000, 1),
    ('Salesperson', 80000, 1),
    ('Lead Engineer', 150000, 2),
    ('Software Engineer', 120000, 2),
    ('Marketing Manager', 100000, 3),
    ('Marketing Coordinator', 75000, 3),
    ('Finance Manager', 120000, 4),
    ('Accountant', 85000, 4);

-- Adding Employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES
    ('John', 'Doe', 1, NULL),
    ('Jane', 'Doe', 2, 1),
    ('Bob', 'Smith', 3, NULL),
    ('Alice', 'Jones', 4, 3),
    ('Tom', 'Johnson', 5, NULL),
    ('Kate', 'Williams', 6, 5),
    ('Mark', 'Davis', 7, NULL),
    ('Sara', 'Taylor', 8, 7);