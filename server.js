const mysql = require("mysql2");
const inquirer = require("inquirer");
const consoleTable = require("console.table");

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "password",
    database: "staff_db",
  },
  console.log(`staff_db connected`)
);

const promptUser = () => {
  return inquirer
    .prompt([
      {
        type: "list",
        message: "Pick a section",
        name: "selection",
        choices: [
          "All employees",
          "Add employee",
          "Update employee role",
          "All departments",
          "Add department",
          "All roles",
          "Add role",
        ],
      },
    ])

    .then((data) => {
      switch (data.selection) {
        case "All employees":
          allEmployees();
          break;

        case "Add employee":
          addEmployee();
          break;

        case "Update employee role":
          updateEmployeeRole();
          break;

        case "All departments":
          allDepartments();
          break;

        case "Add department":
          addDepartment();
          break;

        case "All roles":
          allRoles();
          break;

        case "Add role":
          addRole();
          break;
      }
    });
};

// user prompt
promptUser();

// all employee prompt
const allEmployees = () => {
  db.query(
    `
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
  `,
    function (err, results) {
      console.log(`\n`);
      console.table(results);
      promptUser();
    }
  );
};

// add employee prompts
const addEmployee = () => {
  const roleArray = [];
  const employeeArray = [];
  db.query(`SELECT * FROM role`, function (err, results) {
    for (let i = 0; i < results.length; i++) {
      roleArray.push(results[i].title);
    }
    db.query(`SELECT * FROM employee`, function (err, results) {
      for (let i = 0; i < results.length; i++) {
        let employeeName = `${results[i].first_name} ${results[i].last_name}`;
        employeeArray.push(employeeName);
      }
      return inquirer
        .prompt([
          {
            type: "input",
            message: "Employee's first name",
            name: "first_name",
          },
          {
            type: "input",
            message: "Employee's last name",
            name: "last_name",
          },
          {
            type: "list",
            message: "Employee's role",
            name: "role",
            choices: roleArray,
          },
          {
            type: "list",
            message: "Does the employee have a manager?",
            name: "has_manager",
            choices: ["Yes", "No"],
          },
        ])
        .then((data) => {
          let roleName = data.role;
          let first_name = data.first_name;
          let last_name = data.last_name;
          let role_id = "";
          let manager = "";
          db.query(
            `SELECT id FROM role WHERE role.title = ?`,
            data.role,
            (err, results) => {
              role_id = results[0].id;
            }
          );
          if (data.has_manager === "Yes") {
            return inquirer
              .prompt([
                {
                  type: "list",
                  message: "Select a manager",
                  name: "manager",
                  choices: employeeArray,
                },
              ])
              .then((data) => {
                db.query(
                  `SELECT id FROM role WHERE role.title = ?`,
                  roleName,
                  (err, results) => {
                    role_id = results[0].id;
                  }
                );
                db.query(
                  `SELECT id FROM employee WHERE employee.first_name = ? AND employee.last_name = ?;`,
                  data.manager.split(" "),
                  (err, results) => {
                    manager = results[0].id;
                    db.query(
                      `INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                      VALUES (?,?,?,?)`,
                      [first_name, last_name, role_id, manager],
                      (err, results) => {
                        console.log("\nNew employee added");
                        allEmployees();
                      }
                    );
                  }
                );
              });
          } else {
            manager = null;
            db.query(
              `SELECT id FROM role WHERE role.title = ?`,
              roleName,
              (err, results) => {
                role_id = results[0].id;
                db.query(
                  `INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                  VALUES (?,?,?,?)`,
                  [data.first_name, data.last_name, role_id, manager],
                  (err, results) => {
                    console.log("\nNew employee added");
                    allEmployees();
                  }
                );
              }
            );
          }
        });
    });
  });
};

// update employee role prompts
const updateEmployeeRole = () => {
  const roleArray = [];
  const employeeArray = [];
  db.query(`SELECT * FROM role`, function (err, results) {
    for (let i = 0; i < results.length; i++) {
      roleArray.push(results[i].title);
    }
    db.query(`SELECT * FROM employee`, function (err, results) {
      for (let i = 0; i < results.length; i++) {
        let employeeName = `${results[i].first_name} ${results[i].last_name}`;
        employeeArray.push(employeeName);
      }
      return inquirer
        .prompt([
          {
            type: "list",
            message: "Pick an employee to update",
            name: "employee",
            choices: employeeArray,
          },
          {
            type: "list",
            message: "Employee's new role",
            name: "role",
            choices: roleArray,
          },
        ])
        .then((data) => {
          db.query(
            `SELECT id FROM role WHERE role.title = ?;`,
            data.role,
            (err, results) => {
              role_id = results[0].id;
              db.query(
                `SELECT id FROM employee WHERE employee.first_name = ? AND employee.last_name = ?;`,
                data.employee.split(" "),
                (err, results) => {
                  db.query(
                    `UPDATE employee SET role_id = ? WHERE id = ?;`,
                    [role_id, results[0].id],
                    (err, results) => {
                      console.log("\nEmployee role updated. See below:");
                      allEmployees();
                    }
                  );
                }
              );
            }
          );
        });
    });
  });
};

// all roles prompt
const allRoles = () => {
  db.query(`SELECT * FROM role`, function (err, results) {
    console.log(`\n`);
    console.table(results);
    promptUser();
  });
};

// add role prompts
const addRole = () => {
  let departmentArray = [];
  db.query(`SELECT * FROM department`, function (err, results) {
    for (let i = 0; i < results.length; i++) {
      departmentArray.push(results[i].name);
    }
    return inquirer
      .prompt([
        {
          type: "input",
          message: "Name of new role",
          name: "title",
        },
        {
          type: "input",
          message: "Salary of the new role",
          name: "salary",
        },
        {
          type: "list",
          message: "Department of the new role",
          name: "department",
          choices: departmentArray,
        },
      ])
      .then((data) => {
        db.query(
          `SELECT id FROM department WHERE department.name = ?`,
          data.department,
          (err, results) => {
            let department_id = results[0].id;
            db.query(
              `INSERT INTO role(title, salary, department_id)
          VALUES (?,?,?)`,
              [data.title, data.salary, department_id],
              (err, results) => {
                console.log("\nNew role added");
                allRoles();
              }
            );
          }
        );
      });
  });
};

// all department prompt
const allDepartments = () => {
  db.query(`SELECT * FROM department`, function (err, results) {
    console.log(`\n`);
    console.table(results);
    promptUser();
  });
};

// add department prompts
const addDepartment = () => {
  return inquirer
    .prompt([
      {
        type: "input",
        message: "Name of the new department",
        name: "name",
      },
    ])
    .then((data) => {
      db.query(
        `INSERT INTO department (name) VALUES (?)`,
        data.name,
        (err, results) => {
          console.log("\nNew department added");
          allDepartments();
        }
      );
    });
};
