const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoListUL = document.getElementById("todo-list");
const clearBtn = document.getElementById("clear");
const tabButtons = document.querySelectorAll(".tab-btn");

// Current storage type (default: local)
let currentStorage = "local";

// Initialize the app
initApp();

// Event listeners
todoForm.addEventListener("submit", (e) => {
	e.preventDefault();
	addTodo();
});

clearBtn.addEventListener("click", () => {
	clearAllTodos();
});

tabButtons.forEach((btn) => {
	btn.addEventListener("click", () => {
		// Update active tab
		tabButtons.forEach((b) => b.classList.remove("active"));
		btn.classList.add("active");

		// Update current storage type
		currentStorage = btn.getAttribute("data-storage");

		// Update todo list
		updateTodoList();
	});
});

// Initialize the app
function initApp() {
	updateTodoList();
}

// Add a new todo
function addTodo() {
	const todoText = todoInput.value.trim();
	if (todoText.length > 0) {
		const todoObj = {
			text: todoText,
			completed: false,
		};

		// Get current todos
		const allTodos = getTodos();

		// Add new todo
		allTodos.push(todoObj);

		// Save todos
		saveTodos(allTodos);

		// Update UI
		updateTodoList();

		// Clear input
		todoInput.value = "";
	}
}

// Update the todo list UI
function updateTodoList() {
	// Get todos from current storage
	const allTodos = getTodos();

	// Clear the list
	todoListUL.innerHTML = "";

	// Add storage indicator
	const storageIndicator = document.createElement("div");
	storageIndicator.className = "storage-indicator";

	switch (currentStorage) {
		case "local":
			storageIndicator.textContent = "Using localStorage";
			break;
		case "session":
			storageIndicator.textContent = "Using sessionStorage";
			break;
		case "cookie":
			storageIndicator.textContent = "Using cookies";
			break;
	}

	todoListUL.appendChild(storageIndicator);

	// Add todos to the list
	allTodos.forEach((todo, todoIndex) => {
		const todoItem = createTodoItem(todo, todoIndex);
		todoListUL.appendChild(todoItem);
	});
}

// Create a todo item element
function createTodoItem(todo, todoIndex) {
	const todoText = todo.text;
	const todoId = "todo-" + todoIndex;
	const todoLI = document.createElement("li");
	todoLI.className = "todo";
	todoLI.innerHTML = `
    <input type="checkbox" id="${todoId}">
                <label class="custom-checkbox" for="${todoId}">
                    <svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                        <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
                    </svg>
                </label>
                <label for="${todoId}" class="todo-text">
                    ${todoText}
                </label>
                <button class="delete-button">
                    <svg fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                    </svg>
                </button>
    `;

	// Add event listener for delete button
	const deleteButton = todoLI.querySelector(".delete-button");
	deleteButton.addEventListener("click", () => {
		deleteTodoItem(todoIndex);
	});

	// Add event listener for checkbox
	const checkbox = todoLI.querySelector("input");
	checkbox.addEventListener("change", () => {
		const allTodos = getTodos();
		allTodos[todoIndex].completed = checkbox.checked;
		saveTodos(allTodos);
	});

	// Set checkbox state
	checkbox.checked = todo.completed;

	return todoLI;
}

// Delete a todo item
function deleteTodoItem(todoIndex) {
	let allTodos = getTodos();
	allTodos = allTodos.filter((_, i) => i !== todoIndex);
	saveTodos(allTodos);
	updateTodoList();
}

// Clear all todos
function clearAllTodos() {
	switch (currentStorage) {
		case "local":
			localStorage.removeItem("todos");
			break;
		case "session":
			sessionStorage.removeItem("todos");
			break;
		case "cookie":
			deleteCookie("todos");
			break;
	}
	updateTodoList();
}

// Get todos from current storage
function getTodos() {
	let todosJson = "[]";

	switch (currentStorage) {
		case "local":
			todosJson = localStorage.getItem("todos") || "[]";
			break;
		case "session":
			todosJson = sessionStorage.getItem("todos") || "[]";
			break;
		case "cookie":
			todosJson = getCookie("todos") || "[]";
			break;
	}

	return JSON.parse(todosJson);
}

// Save todos to current storage
function saveTodos(todos) {
	const todosJson = JSON.stringify(todos);

	switch (currentStorage) {
		case "local":
			localStorage.setItem("todos", todosJson);
			break;
		case "session":
			sessionStorage.setItem("todos", todosJson);
			break;
		case "cookie":
			setCookie("todos", todosJson, 30); // 30 days expiration
			break;
	}
}

function setCookie(name, value, days) {
	const expires = new Date();
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
	document.cookie = `${name}=${encodeURIComponent(
		value
	)};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
	const cookies = document.cookie.split(";");
	for (let cookie of cookies) {
		cookie = cookie.trim();
		if (cookie.startsWith(name + "=")) {
			return decodeURIComponent(cookie.substring(name.length + 1));
		}
	}
	return "";
}

function deleteCookie(name) {
	document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}
