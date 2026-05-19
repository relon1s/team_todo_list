const STORAGE_KEY = 'team_tasks';

let tasks = [];         // массив задач в памяти
let nextId = 1;
let currentFilter = 'all';

// DOM элементы
const taskInput = document.getElementById('taskInput');
const assigneeInput = document.getElementById('assigneeInput');
const deadlineInput = document.getElementById('deadlineInput');
const addButton = document.getElementById('addButton');
const taskListEl = document.getElementById('taskList');
const taskCountSpan = document.getElementById('taskCount');
const filterBtns = document.querySelectorAll('.filter-btn');

// загрузка данных из localStorage при старте
function loadTasksFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            tasks = JSON.parse(stored);
            if (tasks.length > 0) {
                nextId = Math.max(...tasks.map(t => t.id)) + 1;
            } else {
                nextId = 1;
            }
        } catch (e) { console.warn(e); tasks = []; }
    }
    renderTasks();
}

function saveTasksToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getFilteredTasks() {
    if (currentFilter === 'active') return tasks.filter(t => !t.completed);
    if (currentFilter === 'completed') return tasks.filter(t => t.completed);
    return tasks;
}

function formatDate(dateStr) {
    if (!dateStr) return 'Без дедлайна';
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
}

function renderTasks() {
    const filtered = getFilteredTasks();

    if (filtered.length === 0) {
        taskListEl.innerHTML = '<div class="empty-message">Нет задач в этом разделе</div>';
        taskCountSpan.textContent = `Задач в списке: ${tasks.length}`;
        return;
    }

    const tasksHtml = filtered.map(task => `
        <li class="task-item ${task.completed ? 'completed-task' : ''}" data-id="${task.id}">
            <div class="task-info">
                <span class="task-text">${escapeHtml(task.text)}</span>
                <span class="task-assignee">👤 ${escapeHtml(task.assignee)}</span>
            </div>
            <div class="task-controls">
                <span class="task-deadline">${formatDate(task.deadline)}</span>
                <input type="checkbox" class="complete-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                <button class="delete-btn" data-id="${task.id}">🗑️</button>
            </div>
        </li>
    `).join('');

    taskListEl.innerHTML = tasksHtml;
    taskCountSpan.textContent = `Задач в списке: ${tasks.length}`;

    document.querySelectorAll('.complete-checkbox').forEach(cb => {
        cb.removeEventListener('change', handleCheckboxChange);
        cb.addEventListener('change', handleCheckboxChange);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.removeEventListener('click', handleDeleteClick);
        btn.addEventListener('click', handleDeleteClick);
    });
}

function handleCheckboxChange(e) {
    const checkbox = e.currentTarget;
    const taskId = parseInt(checkbox.dataset.id);
    const completed = checkbox.checked;
    toggleTaskCompletion(taskId, completed);
}

function handleDeleteClick(e) {
    const btn = e.currentTarget;
    const taskId = parseInt(btn.dataset.id);
    deleteTaskById(taskId);
}

function addTask(text, assignee, deadline) {
    if (!text || text.trim() === '') {
        alert('Введите текст задачи');
        return false;
    }
    const newTask = {
        id: nextId++,
        text: text.trim(),
        assignee: assignee ? assignee.trim() : 'Не назначен',
        deadline: deadline,
        completed: false
    };
    tasks.push(newTask);
    saveTasksToStorage();
    renderTasks();
    return true;
}

function toggleTaskCompletion(id, completed) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = completed;
        saveTasksToStorage();
        renderTasks();
    }
}

function deleteTaskById(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasksToStorage();
    renderTasks();
}

function setFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    renderTasks();
}

// Защита от XSS
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function onAddClick() {
    const text = taskInput.value;
    const assignee = assigneeInput.value;
    const deadline = deadlineInput.value;

    if (addTask(text, assignee, deadline)) {
        taskInput.value = '';
        assigneeInput.value = '';
        deadlineInput.value = '';
        taskInput.focus();
    }
}

// инициализация событий
function init() {
    loadTasksFromStorage();

    addButton.addEventListener('click', onAddClick);
    taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') onAddClick(); });
    assigneeInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') onAddClick(); });
    deadlineInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') onAddClick(); });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });
}

// Запуск приложения
init();