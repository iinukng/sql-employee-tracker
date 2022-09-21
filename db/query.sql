SELECT
employees_with_managers.id AS employee_id,
employees_with_managers.first_name,
employees_with_managers.last_name,
employee_data.title,
employee_data.salary,
employee_data.department_name,
employees_with_managers.manager_name
FROM employee_data
JOIN employees_with_managers on employee_data.role_id = employees_with_managers.role_id;
