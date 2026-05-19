// Массив для хранения задач
let tasks = [];
let currentFilter = 'all';

// Получаем элементы страницы
const taskInput = document.getElementById('taskInput');
const assigneeInput = document.getElementById('assigneeInput');
const addButton = document.getElementById('addButton');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const filterButtons = document.querySelectorAll('.filter-btn');

// Функция добавления задачи
function addTask() {
    const taskText = taskInput.value.trim();
    const assignee = assigneeInput.value.trim();
    
    // Проверка на пустые поля
    if (taskText === '') {
        alert('Введите текст задачи!');
        return;
    }
    
    if (assignee === '') {
        alert('Укажите исполнителя!');
        return;
    }
    
    // Создаём объект задачи
    const task = {
        id: Date.now(),
        text: taskText,
        assignee: assignee,
        completed: false
    };
    
    // Добавляем в массив
    tasks.push(task);
    
    // Очищаем поля ввода
    taskInput.value = '';
    assigneeInput.value = '';
    
    // Обновляем отображение
    renderTasks();
}

// Функция отображения задач
function renderTasks() {
    // Очищаем список
    taskList.innerHTML = '';
    
    // Фильтруем задачи
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    // Создаём элементы для каждой задачи
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        if (task.completed) {
            li.classList.add('completed');
        }
        
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleTask(${task.id})">
            <div class="task-content">
                <div class="task-text">${task.text}</div>
                <div class="task-assignee">👤 ${task.assignee}</div>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Удалить</button>
        `;
        
        taskList.appendChild(li);
    });
    
    // Обновляем счётчик
    updateCounter();
}

// Функция переключения статуса задачи
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        renderTasks();
    }
}

// Функция удаления задачи
function deleteTask(id) {
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
        tasks = tasks.filter(t => t.id !== id);
        renderTasks();
    }
}

// Функция обновления счётчика
function updateCounter() {
    const activeTasks = tasks.filter(t => !t.completed).length;
    taskCount.textContent = `Задач: ${tasks.length} | Активных: ${activeTasks}`;
}

// Функция установки фильтра
function setFilter(filter) {
    currentFilter = filter;
    
    // Обновляем активную кнопку
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    renderTasks();
}

// Обработчики событий
addButton.addEventListener('click', addTask);

// Добавление задачи по нажатию Enter
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

assigneeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Фильтры
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

// Инициализация
renderTasks();