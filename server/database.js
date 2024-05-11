import 'dotenv/config';
import express from "express";
import mysql from 'mysql2';

const app=express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host :process.env.host,
  user:process.env.user,
  password:process.env.password,
  database:process.env.database,
  port:process.env.port
});

// connection.connect((err) => {
//   if (err) {
//       console.error('Error connecting to MySQL database:', err);
//       return;
//   }
//   console.log('Connected to MySQL database');
// });
// // const createTableQuery = `
// // CREATE TABLE IF NOT EXISTS users (
// //     id INT AUTO_INCREMENT PRIMARY KEY,
// //     username VARCHAR(255) NOT NULL,
// //     email VARCHAR(255) NOT NULL
// // )
// // `;

// const insertQuery = `
// INSERT INTO users (id,username, email)
// VALUES (2,'john_doe2', 'john@example.com2')
// `;

// // connection.query(createTableQuery, (err, results) => {
// //   if (err) {
// //       console.error('Error executing query:', err);
// //       return;
// //   }
// //   console.log("created table successfully",results);
// // });

// connection.query(insertQuery, (err, results) => {
//   if (err) {
//       console.error('Error executing query:', err);
//       return;
//   }
//   console.log("inserted in table successfully");
// });



// connection.query("SELECT * FROM users", (err, results) => {
//   if (err) {
//       console.error('Error executing query:', err);
//       return;
//   }
//   console.log("created table successfully",results);
// });

app.get('/',(req,res)=>{
res.send("hello");
});

app.post('/newEntity',(req,res)=>{
  console.log(req.body.entity,req.body.values);
  // 
  const query = `
    SELECT *
    FROM information_schema.tables
    WHERE table_schema = ?
    AND table_name = ?
  `;
  connection.query(query, [process.env.database, req.body.entity], (err, results) => {
    if (err) {
      console.error('Error checking table existence:', err);
      res.send("UNABEL TO ADD NEW ENTITY TRY AGAIN");
    }

    if (results.length > 0) {
      res.send("TABLE ALREADY EXIST");
    } else {
      console.log("entity dont exist");
      var concatenatedString = req.body.values.join(', ');
      
        console.log(concatenatedString);
      const createTableQuery = `
      CREATE TABLE  ${req.body.entity} (
          ${concatenatedString}
      )
      `;

      connection.query(createTableQuery, (err, results) => {
          if (err) {
              console.error('Error executing query:', err);
              res.send("UNABEL TO ADD NEW ENTITY TRY AGAIN");
          }
          console.log("created table successfully",results);
          res.send("ENTITY CREATED");
        });
        

    } 

  });

     
});

app.get('/alltables',(req,res)=>{
  console.log("alltables");
  const query = `
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = ?
`;

// Execute the query
connection.query(query, [process.env.database], (err, results) => {
  if (err) {
    console.error('Error getting table names:', err);
    // Close the connection
    res.status(404).send("NOT ABLE TO FETCH TABLE");
     
  }
  console.log(results);
  // Extract table names from the result set
  const tableNames = results.map((row)=>  row.TABLE_NAME);
  console.log('Table names:', tableNames);
  res.send(tableNames);
     
});
  

}); 
 

app.post('/tabledata',(req,res)=>{
  console.log("HERE");
console.log(req.body.table);
if(req.body.table==='')res.send("");
else{
connection.query(`SELECT * FROM ${req.body.table}`, (err, results) => {
    if (err) {
        console.error('Error executing query:', err);
        res.send("NODATA");
        
    }
    console.log("Table data:",results);
    res.send(results);
   
  });}
  
});


app.post('/deletetable',(req,res)=>{
  const query = `DROP TABLE ${req.body.table}`;

  // Execute the query
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error deleting table:', err);
     res.send("UNABLE TO DROP")
    }

    console.log('Table deleted successfully');
    res.send("DROPPED SUCCESSFULLY");
  });

});
 
app.post('/addnewrow',(req,res)=>{
console.log(req.body.d,req.body.table);
var key=Object.keys(req.body.d);
var values=[];
key.filter((k)=>{
values.push(req.body.d[k]);
});
const query = `SELECT * FROM ${req.body.table} WHERE ${key[0]}=${values[0]} `;
    console.log(query);
  // Execute the SQL query
  connection.query(query, [process.env.database], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      // Close the connection
      res.send(err);
      return ;
    }
    console.log(results);


    // Check if any rows were returned
    if (results.length > 0) {
      console.log('Row already exists');
      res.send("UNABLE TO ADD NEW ROW AS PRIMARY KEY EXISTS");
      return ;
    } else {
      var k=key.join(', ');
        
      var v=values.join("','");
      var arr="'"+v+"'";
      const insertQuery = `
      INSERT INTO ${req.body.table} (${k})
      VALUES (${arr})
      `;
      console.log(insertQuery);
     connection.query(insertQuery, (err, results) => {
  if (err) {
      console.error('Error executing query:', err);
      res.send(err);
      return;
  }
  console.log("inserted in table successfully");
  res.send("ADDED");
});

    }
  });

  
})



app.post('/deleterow',(req,res)=>{
   
console.log(req.body.row);
const keys = Object.keys(req.body.row);
const firstkey=keys[0];
const firstvalue=req.body.row[firstkey];
// Get the first key

  const query = `
    DELETE FROM ${req.body.table}
    WHERE ${firstkey}=${firstvalue};
  `;
  console.log(query);
  // Execute the SQL query
  connection.query(query, (err, result) => {
    if (err) {
      console.error('Error executing DELETE query:', err);
      // Close the connection
      res.send("Unable to delete");
    }
    console.log('Number of rows deleted:', result.affectedRows);
    res.send("DELETED");
  });
  
})

app.post('/updaterow',async(req,res)=>{
  try{
console.log(req.body.table,req.body.nrow);
const values = Object.keys(req.body.nrow);
//{"age":"15"}
const firstValue = req.body.nrow[values[0]];
console.log(values[0],firstValue);
  var y=`UPDATE ${req.body.table} SET `;
  var datatoupdate=[];
 
  for(var j=1;j<values.length;j++){
    y+=`${values[j]}=?, `;
    datatoupdate.push(req.body.nrow[values[j]]);
  }
  var z=` WHERE  ${values[0]}=${firstValue} `;
  var x=y.substring(0,y.length-2);
  x+=z;
  console.log(x,datatoupdate);
 

var t= connection.query(x,datatoupdate, (error, results) => {
  if (error) {
    console.error('Error updating row:', error);
    res.send(error);
  } else {
    console.log('Row updated successfully.');
    res.send("UPDATED");
  
   }
});

//console.log("rows:",rows);

}
catch(err){
  console.log("here:",err);
  res.send("UNABLE TO UPDATE");
}

}); 


app.listen(8085,()=>{
  console.log('server starterd at 8085');
})