// DOM Elements
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const taskTemplate = document.getElementById('task-template');
const tasksCounter = document.getElementById('tasks-counter');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');
const userNameElement = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

// App State
let tasks = [];
let currentFilter = 'all';
let currentUser = null;

// Load tasks from local storage for current user
function loadTasks() {
    // Get current user
    currentUser = window.authUtils.getLoggedInUser();
    
    if (!currentUser) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Display user name
    userNameElement.textContent = currentUser.fullname;
    
    // Load tasks for this user
    const savedTasks = localStorage.getItem(`todo-tasks-${currentUser.id}`);
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

// Save tasks to local storage for current user
function saveTasks() {
    if (currentUser) {
        localStorage.setItem(`todo-tasks-${currentUser.id}`, JSON.stringify(tasks));
    }
}

// Generate unique ID for tasks
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date for display
function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        return 'Invalid date';
    }
    
    // Format date in dd/mm/yyyy hh:mm:ss format as requested
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// Add new task
function addTask(text) {
    if (text.trim() === '') return;
    
    const newTask = {
        id: generateId(),
        text: text.trim(),
        completed: false,
        createdAt: new Date(),
        completedAt: null
    };
    
    tasks.unshift(newTask); // Add to beginning of array
    saveTasks();
    renderTasks();
    taskInput.value = '';
    taskInput.focus();
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Toggle task completion
function toggleTaskCompletion(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            const isCompleting = !task.completed;
            return { 
                ...task, 
                completed: isCompleting,
                completedAt: isCompleting ? new Date() : null
            };
        }
        return task;
    });
    saveTasks();
    renderTasks();
}

// Edit task
function editTask(id, newText) {
    if (newText.trim() === '') return;
    
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, text: newText.trim() };
        }
        return task;
    });
    saveTasks();
    renderTasks();
}

// Clear completed tasks
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

// Filter tasks
function filterTasks(filter) {
    currentFilter = filter;
    renderTasks();
    
    // Update active filter button
    filterBtns.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Create task element
function createTaskElement(task) {
    const taskClone = document.importNode(taskTemplate.content, true);
    const taskItem = taskClone.querySelector('.task-item');
    const taskText = taskClone.querySelector('.task-text');
    const taskCheck = taskClone.querySelector('.task-check');
    const editBtn = taskClone.querySelector('.edit-btn');
    const deleteBtn = taskClone.querySelector('.delete-btn');
    
    // Set task data
    taskItem.dataset.id = task.id;
    taskText.textContent = task.text;
    taskCheck.checked = task.completed;
    
    if (task.completed) {
        taskItem.classList.add('completed');
    }
    
    // Add timestamp info
    const timestampDiv = document.createElement('div');
    timestampDiv.className = 'task-timestamps';
    
    // Format the creation date
    const createdDate = new Date(task.createdAt);
    const createdFormatted = formatDate(createdDate);
    
    // Add created timestamp
    const createdSpan = document.createElement('span');
    createdSpan.className = 'timestamp created-time';
    createdSpan.innerHTML = `<i class="fas fa-clock"></i> Created: ${createdFormatted}`;
    timestampDiv.appendChild(createdSpan);
    
    // Add completed timestamp if available
    if (task.completed && task.completedAt) {
        const completedDate = new Date(task.completedAt);
        const completedFormatted = formatDate(completedDate);
        
        const completedSpan = document.createElement('span');
        completedSpan.className = 'timestamp completed-time';
        completedSpan.innerHTML = `<i class="fas fa-check-circle"></i> Completed: ${completedFormatted}`;
        timestampDiv.appendChild(completedSpan);
    }
    
    // Insert timestamps after task-main div
    taskItem.appendChild(timestampDiv);
    
    // Event listeners
    taskCheck.addEventListener('change', () => {
        toggleTaskCompletion(task.id);
    });
    
    deleteBtn.addEventListener('click', () => {
        deleteTask(task.id);
    });
    
    editBtn.addEventListener('click', () => {
        // Create edit mode
        taskItem.classList.add('editing');
        
        // Create edit input
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'edit-input';
        editInput.value = task.text;
        
        // Create edit actions
        const editActions = document.createElement('div');
        editActions.className = 'edit-actions';
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.innerHTML = '<i class="fas fa-check"></i>';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cancel-btn';
        cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
        
        editActions.appendChild(saveBtn);
        editActions.appendChild(cancelBtn);
        
        // Replace task text with edit input
        taskItem.querySelector('.task-content').appendChild(editInput);
        taskItem.appendChild(editActions);
        
        // Focus input
        editInput.focus();
        
        // Save edit
        saveBtn.addEventListener('click', () => {
            editTask(task.id, editInput.value);
        });
        
        // Cancel edit
        cancelBtn.addEventListener('click', () => {
            renderTasks();
        });
        
        // Save on Enter, cancel on Escape
        editInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                editTask(task.id, editInput.value);
            } else if (e.key === 'Escape') {
                renderTasks();
            }
        });
    });
    
    return taskClone;
}

// Render tasks
function renderTasks() {
    // Clear task list
    taskList.innerHTML = '';
    
    // Filter tasks
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    // Render filtered tasks
    filteredTasks.forEach(task => {
        taskList.appendChild(createTaskElement(task));
    });
    
    // Update tasks counter
    const activeTasks = tasks.filter(task => !task.completed).length;
    tasksCounter.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
}

// Event Listeners
addTaskBtn.addEventListener('click', () => {
    addTask(taskInput.value);
});

taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addTask(taskInput.value);
    }
});

clearCompletedBtn.addEventListener('click', clearCompleted);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterTasks(btn.dataset.filter);
    });
});

// Logout button
logoutBtn.addEventListener('click', () => {
    window.authUtils.logoutUser();
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});