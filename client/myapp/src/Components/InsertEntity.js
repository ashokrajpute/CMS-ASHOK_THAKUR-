import React,{useState,useEffect} from 'react';
import axios from 'axios';

function InsertEntity() {
    const [Entity,setEntity]=useState('');
    const [rowvalues,setrowvalues]=useState('');
    var [table,settable]=useState([]);
    var [curtable,setcurtable]=useState('');
    var [tablecontent,settablecontent]=useState([]);
    const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');


    
    useEffect(()=>{
      handletables();
    },[]);

    useEffect(()=>{
     handletabledata();
    },[curtable]);

    //to handle tables
    const handletables=async()=>{
      try{var t=await axios.get('/alltables');
     if(t==="NOT ABLE TO FETCH TABLE"){return;}
      settable(t.data);
    
    }catch(err){
      console.log(err);
      window.alert("UNABLE TO FETCH TABLE");
    }
    }

    //to handle table rows
    const handletabledata=async()=>{
     try{var t=await axios.post('/tabledata',{table:curtable},{
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      if(t.data==="NODATA"){console.log("NODATA");}
      else{
      console.log("tdata:",t.data);
           settablecontent([...t.data]);}
           
           
    }catch(err){
      console.log(err);
      window.alert("ERROR Catching TABLE");
    }
      
    }




    // // Event handler to update the name state
    const handleEntityChange = (event) => {
      setEntity(event.target.value);
    };
  
    const handlerowvalueChange = (event) => {
      setrowvalues(event.target.value);
    };
  
    
    const handleSubmit = async  (event) => {
      event.preventDefault();
      
      console.log("entity:",Entity);
      
      let index = Entity.indexOf('(');
      let index2 = Entity.indexOf(')');
      if(index==-1||index2==-1){return ;}
      
      var et=Entity.substr(0,index);
      index++;
      var prop=Entity.substr(index,index2-index);
      console.log(prop);
      if(prop.length==0)return ;
      var array=prop.split(',');
      console.log(array);
      var arr=[];
      array.forEach(function (item) {
        if(item.length>0)arr.push(item + " VARCHAR(255)" );
      });
       arr[0]+=" PRIMARY KEY";
      setEntity('');

     var newet=await axios.post('/newEntity',{entity:et,values:arr},
     {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
     
    });

    

    if(newet.data==="ENTITY CREATED"){
      handletables();
    }
    else{
      window.alert(newet.data);
    }

}

//to delete row
const handleDelterow=async(row)=>{
var t=await axios.post('/deleterow',{table:curtable,row:row},{
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});
if(t.data==="DELETED"){
  handletabledata();
}
else{window.alert("unable to delte the row");}

}

//to delete table
const handleDeltetable=async(table)=>{
  var rslt=await axios.post('/deletetable',{table:table},{
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  if(rslt==="UNABLE TO DROP"){
    window.alert("UNABle TO DELETE TRY AGAIN");
  }
  else{
    handletables();
    
    if(table==curtable){setcurtable('');handletabledata();}
  }

}
//to add new row
const handlesubmitrowvalue =async(event)=>{
  event.preventDefault();
   var t=curtable;
   if(t==''){window.alert("SELECT A TABLE FIRST");return ;}
  console.log("rowvalues:",rowvalues,typeof(rowvalues));
  if(rowvalues[0]!='{'||rowvalues[rowvalues.length-1]!='}'){window.alert("false input pattern");return;}
   var nd=JSON.parse(rowvalues);
   var d=await axios.post('/addnewrow',{d:nd,table:t},{
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
   });
   console.log("DATA:",d.data);
   if(d.data==="ADDED"){
     handletabledata();
     setrowvalues('');
   }
   else{
    window.alert(d.data);
   }
}
  
  const handleUpdateClick = () => {
    setShowInput(true);

  };
  function mergeObjects(obj1, obj2) {
    const merged = {};
    
    // Iterate through keys of obj1
    for (const key in obj1) {
      if (obj1.hasOwnProperty(key)) {
        // Check if the key exists in obj2
        if (obj2.hasOwnProperty(key)) {
          // Add the values if the key exists in both objects
          merged[key] = obj2[key];
        } else {
          // Keep the value from obj1 if the key doesn't exist in obj2
          merged[key] = obj1[key];
        }
      }
    }
  
    
    
  
    return merged;
  }
  

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleUpdate = async(row) => {
    // Perform update logic here, e.g., send inputValue to backend
    console.log('Updated value:', typeof(inputValue),row['id']);
    // After update, hide the input field
     try{
        var val=JSON.parse(inputValue);
        console.log(val);
        const result = mergeObjects(row, val);
        console.log(result);
        const values = Object.values(row);

// Access the first value in the array
       const firstValue = values[0];
       const values2 = Object.values(result);

// Access the first value in the array
       const firstValue2 = values2[0];
        if(firstValue!=firstValue2){
             window.alert("CANT CHANGE PRIVATE KEY");return;
        }
        else{
            var up=await axios.post('/updaterow',{table:curtable,nrow:result},{headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
           });
           console.log("up:",up,up.data);
           if(up.data==="UPDATED"){
            handletabledata();
           }
           else{
            console.log(up.data);
            window.alert("UNABLE TO PERFORM UPDATE",up.data);
           }


        }
     }
     catch(err){
    window.alert("ENTER Data in JSON string  format")
     }
      setShowInput(false);
      setInputValue('');

  };
  var content1='Dataformat to enter for creating new entity: Entity(Key1(primary key),key2,key3,key4,..)';
  var content2='Dataformat to enter for creating new row: {"key"(primary key):"value","key":"value","key":"value",...}';
  var content3='NEED TO SELECT A TABLE FIRST TO ENTER ROW INTO THAT TABLE OR TO VIEW THE CONTENT OF TABLE';
  var content4='Dataformat to update the existing entity: {"key":"value","key":"value",...}'

    return (
      <div className='outercss'>
        <div className="outerform">
        <p>&#x2B50;{content1}</p>
        <p>&#x2B50;{content2}</p>
        <p>&#x2B50;{content3}</p>
      <p>&#x2B50;{content4}</p>
        
      <form onSubmit={handleSubmit} className='form'>
       
          <input
           className='input'
            placeholder='Entity(values1(primary key),value2,value3,value4,..)'
            type="text"
            id="name"
            value={Entity}
            onChange={handleEntityChange}
            required
          />
        <button type="submit" className='btn'>Submit</button>
      </form>
      </div>
      <div className='innercss'>
        <div className='tabledata'>
        {tablecontent.length > 0 ? tablecontent.map((row, index) => (
         <div key={index} className='infoblock'>
        {Object.keys(row).map((key, keyIndex) => (
            <div key={keyIndex}className='infoblockinner'>
                <h6>{key}: {row[key]}</h6>
            </div>
        ))}
        <button  onClick={()=>handleDelterow(row)}>Delete</button>
        {/* <button  style={{backgroundColor:"yellow",color:'black'}} onClick={()=>handleupdaterow(row)}>Update</button> */}
        <div>
      
      {showInput ? (
        <div>
          <input
            type="text"
            placeholder="Enter your updated value"
            value={inputValue}
            onChange={handleInputChange}
          />
          <button onClick={()=>handleUpdate(row)}>Update</button>
        </div>
      ) : (
        <button onClick={handleUpdateClick}>Update</button>
      )}
    </div>
    </div>
)) : null}
   
   <form onSubmit={handlesubmitrowvalue} className='inputtablevalue'>
          <input
           className='inputvalue'
            placeholder='{"key"(primary key):"value","key":"value","key":"value",...}'
            type="text"
            id="name"
            value={rowvalues}
            onChange={handlerowvalueChange}
            required
          />
        <button type="submit" className='btninp'>ADD NEW ROW</button>
        </form>
        </div>
        <div className='tables'>
        <h2>TABLES</h2>
          {
            table.map((t)=>(
               <button className={curtable==t ? "actouterbtn" : "outerbtn"}   onClick={()=>{setcurtable(t)}}>
                {t}
                <button className="innerbtn" onClick={()=>handleDeltetable(t)}>DELETE</button>
                </button>
            ))
          }
        </div>
      </div>

      </div>
    );
  }

export default InsertEntity