USE company_db;

-- Inserting data into the departments table

INSERT INTO departments (name) VALUES 
    ('Sales'),
    ('Engineering'),
    ('Marketing'),
    ('Finance');

-- Inserting data into the roles table

INSERT INTO roles (title, salary, department_id) VALUES
    ('Salesperson', 50000, 1),
    ('Sales Manager', 80000, 1),
    ('Software Engineer', 75000.00, 2),
    ('Senior Software Engineer', 100000.00, 2),
    ('Marketing Coordinator', 45000.00, 3),
    ('Marketing Manager', 80000.00, 3),
    ('Accountant', 60000.00, 4),
    ('Financial Analyst', 75000.00, 4);

-- Insert data into the employees table

INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES 
    ('John', 'Doe', 1, NULL),
    ('Jane', 'Smith', 2, 1),
    ('Bob', 'Johnson', 3, NULL),
    ('Alice', 'Williams', 4, 3),
    ('David', 'Brown', 5, NULL),
    ('Sarah', 'Lee', 6, 5),
    ('Mike', 'Davis', 7, NULL),
    ('Emily', 'Garcia', 8, 7);