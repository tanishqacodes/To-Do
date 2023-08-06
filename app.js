const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path"); // path module to join paths

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

const taskFilePath = path.join(__dirname,"data.json");

// get request to get all thee tasks and send the array of a objects in JSON to client

app.get("/tasks",(req,res)=>{
    readTaskFile((err,tasks)=>{
        if(err){
            res.status(500).json({error: "failed to read tasks file..."});
            return;
        }
        res.json(tasks);
    });
});

// POST to add new Todo to the file and send back the todo that was added

app.post("/tasks",(req,res)=>{
    // save new task to the variable
    const newTaskText = req.body.task;

    if(!newTaskText || newTaskText.trim() === ""){
        // if the task is empty
        res.status(400).json({error : "Task text cannot be empty"});

        return;
    }
    
    readTaskFile((err,tasks)=>{
        if(err){
            res.status(500).json({error:"Failed to reasd tasks file."});
        }
        else{
            // if tasksFile is empty , set newtask id to 1 else set to taskId+1 of last

            const newTaskId = tasks.length > 0 ? tasks[tasks.length-1].id+1 : 1;

            // create new task
            const newTask = {
                id : newTaskId,
                text : newTaskText,
                completed:false,
            };

            tasks.push(newTask); // add new task to task array

            writeTasksFile(tasks,(err)=>{
                // write task back to file
                if(err){
                    res.status(500).json({error : "Failed to write taks file."});
                }
                else{
                    // send back the new task (for displaying in the page)
                    res.json({message : "Task added successfully..",task:newTask});
                }
            });
        }
    });

});


// handle put request 
// id will be fetched using req.params.is(: specifies that it is a parameter)

app.put("/tasks/:id",(req,res)=>{
    // save id to var
    const taskId = parseInt(req.params.id);
    const completed = req.body.completed; //save the send completed status

    readTaskFile((err,tasks)=>{
        if(err){
            res.status(500).json({error : "Failed to read file."});
        }
        else{
            // find what task to modify and save it to task var
            const task = tasks.find((t)=>t.id === taskId);

            if(!task){
                res.status(404).json({error : "Task not found."}); //agar task nhi hai toh
            }
            else{
                // modify the task variable (tasks array modify hoga ab)
                task.completed = completed;

                writeTasksFile(tasks,(err)=>{
                    // write the tasks array containing the modified task to the file
                    if(err){
                        res.status(500).json({error : "Failed to write tasks in file.."});
                    }
                    else{
                        res.json({message:"Task Updated successfully!!",task}); 
                        // return modifiesd task back
                    }
                });
            }
        }
    });

});


// :id specifies data(whatever passed after /tasks while making the request willbe saved to id)

app.delete("/tasks/:id",(req,res)=>{
    const taskId = parseInt(req.params.id);

    // call the read task file fun which will give us all tasks
    readTaskFile((err,tasks)=>{
        if(err){
            res.status(500).json({error : "Failed to read tasks file . "});
        }
        else{
            // tasks.filter will give us a new array excluding the task that has the id=>taskId (this way we will not have the task that we want to delete)
            
            const updateTasks = tasks.filter((t)=>t.id !== taskId);
             //search for the task that we need to delete (search using the id we got using req.params.id)

            //  now update tasks have all the tasks expcept one whch we wanted to del,we can simply write updateted task t0 file
            writeTasksFile(updateTasks,(err)=>{
                if(err){
                    res.status(500).json({error:"Failed to write tasks file"});
                }
                else{
                    res.json({message:"Task deleted successfully.",taskId});
                    //give back the taskId and a msg
                }
            });

        }
    });
});

app.listen(3000,function(){
    console.log("Listening on port : 3000");
});


function readTaskFile(callback){
    // reading the file
    fs.readFile(taskFilePath,"utf-8",function(err,data){
        if(err){
            callback(err,null);
        }
        else{
            try{
                // convert data to object
                const tasks = JSON.parse(data);
                callback(null,tasks); //send the tasks
            }
            catch(parserError){
                callback(parserError);
            }
        }
    });
}


// write tasks array to file (takes an object ansd a callback as args)

function writeTasksFile(tasks,callback){
    // write data to file after converting into json
    fs.writeFile(taskFilePath,JSON.stringify(tasks,null,2),(err)=>{
        if(err){
            callback(err);
        }
        else{
            callback(null);
        }
    });
}

