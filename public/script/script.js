
const submitTodoNode = document.getElementById("submit-todo");
const inputNode = document.getElementById("input-box");

const todoListNode = document.getElementById("task-container");


// this function get all the exusting tasks and show them in list
function getTasks(){
    // sending get request to server
    fetch("/tasks").then((res)=>res.json()
        // the response comes in json format (usko object bano)
        ).then((tasks)=>{
            todoListNode.innerHTML = "";
            tasks.forEach(task => {
               // display task for every that is in the response
                createTaskElement(task.id,task.text,task.completed); 
            });
    }).catch((err)=>console.error("Error fetchng tasks : ",err)
        // handles the error
    );
}

// function to create a task element 
function createTaskElement(taskId,taskText,completed){
    const listItem = document.createElement("li");
    listItem.setAttribute("data-task-id",taskId);
    listItem.innerHTML = `<div class="task-text"> ${taskText}</div>`;
    listItem.innerHTML+=`<div>
        <button class="delete-button">Delete</button>
        <button class="complete-button">Complete</button>
        </div>`;

    if(completed){
        listItem.firstElementChild.classList.add("completed");
    }
    todoListNode.appendChild(listItem);


    // attaching delete button listener to create element

    const deleteButtonNode = listItem.querySelector(".delete-button");

    deleteButtonNode.addEventListener('click',function(){
        deleteTask(taskId);
    });

    const completedButtonNode = listItem.querySelector('.complete-button');

    completedButtonNode.addEventListener("click",function(){
        completedTask(taskId,!completed);
        // change the value of completed flag
        completed = !completed;
    });
}


// add new task on the server
function addTask(taskText){
    // send a post request to the server
    fetch("/tasks",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",  //what type of data are we sending 
        },
        body:JSON.stringify({task:taskText}), //converting the data to JSON
    }).then((res)=>res.json()).then((data)=>{

        console.log("Add task : ",data);
        // recieved data is of the type {message : "new task added" , task:newTask}
        createTaskElement(data.task.id , data.task.text, data.task.completed);

    }).catch((err)=>console.error("Error adding task : " , error));
}


// function to deleted a task by id

function deleteTask(taskId){
    // sending delete request to the server

    fetch(`/tasks/${taskId}`,{
        method:"DELETE",
    }).then(()=>{
        // select the li(task) with the required data-task-id and assign the element to variable taskItem

        // [data-task-id=taskId] is the attribute selector(we can select elements using attrinbuetes)

        const taskItem = document.querySelector(`li[data-task-id="${taskId}"]`);

        // remove the ID from the UI
        taskItem.remove();
    }).catch((error)=>console.error("Error in deleting task : ",error));
}


// function to change the completion status of a task on the server

function completedTask(taskId,completed){
    fetch(`/tasks/${taskId}`,{
        method:"PUT",
        headers:{
            "Content-Type":"application/json",
        },
        body:JSON.stringify({completed}), //sending in the form of JSON
    }).then((response)=>response.json()).then((data)=>{
        // select the task that we modifies

        const taskItem = document.querySelector(`li[data-task-id="${taskId}"]`);

        taskItem.classList.toggle("completed-list");
        taskItem.firstElementChild.classList.toggle("completed",completed);

    }).catch((error)=>console.error("Error updating task : ",error));
}

function getTaskAndCallAddTask(){
    const newTask = inputNode.value.trim();
    console.log("TASk : ",newTask);
    if(newTask !== ""){
        addTask(newTask);
        inputNode.value = "";
    }
}

// click to listener to add new tasks

submitTodoNode.addEventListener("click",function(){
    getTaskAndCallAddTask();
});

inputNode.addEventListener("keypress",function(e){
    if(e.key === "Enter") getTaskAndCallAddTask();
});

// fetch tasks on page load

getTasks();