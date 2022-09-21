-- departments
INSERT INTO department(name)
VALUES ("Engineer"), ("Finance"), ("Legal"), ("Sales");

-- employee roles data
INSERT INTO role(title, salary, department_id)
VALUES ("Lead Engineer",155000, 1),
       ("Software Engineer",125000, 1),
       ("Account Manager",160000, 2),
       ("Accountant",125000, 2),
       ("Legal Lead",250000, 3),
       ("Lawyer",195000, 3),
       ("Sales Lead",110000, 4),
       ("Salesperson",85000, 4);

-- employee data
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Russel", "Webster", 1, null),
       ("Monique", "Knight", 2, 1),
       ("Angela", "Martin", 3, null),
       ("Kevin", "Malone", 4, 3),
       ("Regina", "Smith", 5, null),
       ("Bob", "barber", 6, 5),
       ("Michael", "Scott", 7, null),
       ("Jim", "Halpert", 8, 7);

CREATE VIEW employee_data AS
(SELECT
role.id AS role_id,
role.title,
role.salary,
department.name AS department_name
FROM role 
JOIN department 
on role.department_id = department.id);

CREATE VIEW employees_with_managers AS
(SELECT emp.id,
emp.first_name,
emp.last_name,
emp.role_id,
CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name
FROM employee AS manager RIGHT OUTER JOIN employee AS emp ON manager.id = emp.manager_id);