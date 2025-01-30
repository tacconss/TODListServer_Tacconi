const http=require("http");

const express = require("express");

const app = express();

const bodyParser = require('body-parser');

//MYSQL

const fs = require('fs');

const mysql = require('mysql');

const conf = JSON.parse(fs.readFileSync('conf.json'));

const connection = mysql.createConnection(conf);

//

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({

   extended: true

}));

const path = require('path');

app.use("/", express.static(path.join(__dirname, "public")));

let todos = [];

app.post("/todo/add", (req, res) => {
   const { inputValue, completed = false } = req.body;
   const todo = {
     id: "" + new Date().getTime(), 
     inputValue,
     completed,
   };
   todos.push(todo);
   res.json({ result: "Ok", todo });
 });
 

app.get("/todo", (req, res) => {
console.log(todos);
   res.json({todos: todos});

});

const server = http.createServer(app);

server.listen(8080, () => {

  console.log("- server running");

});

app.put("/todo/complete", (req, res) => {
console.log("dentro");
   let todo = req.body;

   try {

      todos = todos.map((element) => {

         if (element.id === todo.id) {
            element.completed = !todo.completed;

         }

         return element;

      })

   } catch (e) {

      console.log(e);

   }

   res.json({result: "Ok"});

});

app.delete("/todo/:id", (req, res) => {

   todos = todos.filter((element) => element.id !== req.params.id);

   res.json({result: "Ok"});  

})
app.put("/todo/modify", (req, res) => {
   console.log("entrato");
      let todo = req.body;
   
      try {
   
         todos = todos.map((element) => {
   
            if (element.id === todo.id) {
   
               element.inputValue = todo.inputValue;
   
            }
   
            return element;
   
         })
   
      } catch (e) {
   
         console.log(e);
   
      }
   
      res.json({result: "Ok"});
   
   });



   //Esecuzione Query

  

   const executeQuery = (sql) => {

      return new Promise((resolve, reject) => {      
   
            connection.query(sql, function (err, result) {
   
               if (err) {
   
                  console.error(err);
   
                  reject();     
   
               }   
   
               console.log('done');
   
               resolve(result);         
   
         });
   
      })
   
   }

   //Creazione della tabella todo 
   const createTable = () => {

      return executeQuery(`
   
      CREATE TABLE IF NOT EXISTS todo
   
         ( id INT PRIMARY KEY AUTO_INCREMENT, 
   
            name VARCHAR(255) NOT NULL, 
   
            completed BOOLEAN ) 
   
         `);      
   
   }

   const insert = (todo) => {

      const template = `
   
      INSERT INTO todo (name, completed) VALUES ('$NAME', '$COMPLETED')
   
         `;
   
      let sql = template.replace("$NAME", todo.name);
   
      sql = sql.replace("$COMPLETED", todo.completed);
   
      return executeQuery(sql); 
   
   }

   const select = (todo) => {

      const sql = `
   
      SELECT id, name, completed FROM todo 
   
         `;
   
      return executeQuery(sql); 
   
   }

   createTable().then(() => {

      insert({name: "test " + new Date().getTime(), completed: false}).then((result) => {
   
         select().then(console.log);
   
      });
   
   });

   
   