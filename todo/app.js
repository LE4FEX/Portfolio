// Todo App JavaScript

class TodoApp {
  constructor() {
    this.todos = this.loadTodos();
    this.filter = 'all';
    this.searchTerm = '';
    this.currentLanguage = this.loadLanguage();

    // Translations
    this.translations = {
      th: {
        title: 'Todo App',
        subtitle: 'จัดการงานของคุณอย่างมีประสิทธิภาพ',
        addPlaceholder: 'เพิ่มงานใหม่...',
        addButton: 'เพิ่ม',
        searchPlaceholder: 'ค้นหางาน...',
        filterAll: 'ทั้งหมด',
        filterActive: 'ยังไม่เสร็จ',
        filterCompleted: 'เสร็จแล้ว',
        deleteButton: 'ลบ',
        statsTemplate: '{total} งานทั้งหมด • {active} ยังไม่เสร็จ • {completed} เสร็จแล้ว',
        emptyState: 'ยังไม่มีงานในรายการ',
        emptySearch: 'ไม่พบงานที่ค้นหา',
        backToHome: '← กลับหน้าหลัก',
        themeLabel: 'Switch to dark theme',
        themeTitle: 'Switch to dark theme',
        langLabel: 'Switch language',
        langTitle: 'Switch language'
      },
      en: {
        title: 'Todo App',
        subtitle: 'Manage your tasks efficiently',
        addPlaceholder: 'Add new task...',
        addButton: 'Add',
        searchPlaceholder: 'Search tasks...',
        filterAll: 'All',
        filterActive: 'Active',
        filterCompleted: 'Completed',
        deleteButton: 'Delete',
        statsTemplate: '{total} total • {active} active • {completed} completed',
        emptyState: 'No tasks yet',
        emptySearch: 'No tasks found',
        backToHome: '← Back to Home',
        themeLabel: 'Switch to dark theme',
        themeTitle: 'Switch to dark theme',
        langLabel: 'Switch language',
        langTitle: 'Switch language'
      }
    };

    this.initElements();
    this.bindEvents();
    this.updateLanguage();
    this.render();
  }

  initElements() {
    this.newTodoInput = document.getElementById('newTodoInput');
    this.addTodoBtn = document.getElementById('addTodoBtn');
    this.searchInput = document.getElementById('searchInput');
    this.todoList = document.getElementById('todoList');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.statsElement = document.getElementById('todoStats');
    this.toggleLanguageBtn = document.getElementById('toggleLanguage');
    this.titleElement = document.querySelector('.brand h1');
    this.subtitleElement = document.querySelector('.brand p');
    this.backLink = document.querySelector('.nav-link');
  }

  bindEvents() {
    // Add new todo
    this.addTodoBtn.addEventListener('click', () => this.addTodo());
    this.newTodoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTodo();
    });

    // Search
    this.searchInput.addEventListener('input', (e) => {
      this.searchTerm = e.target.value.toLowerCase();
      this.render();
    });

    // Filter buttons
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filter = btn.dataset.filter;
        this.render();
      });
    });

    // Language toggle
    this.toggleLanguageBtn.addEventListener('click', () => this.toggleLanguage());
  }

  addTodo() {
    const text = this.newTodoInput.value.trim();
    if (!text) return;

    const todo = {
      id: Date.now(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.todos.push(todo);
    this.saveTodos();
    this.newTodoInput.value = '';
    this.render();
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
      this.render();
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.saveTodos();
    this.render();
  }

  getFilteredTodos() {
    let filtered = this.todos;

    // Apply filter
    switch (this.filter) {
      case 'active':
        filtered = filtered.filter(t => !t.completed);
        break;
      case 'completed':
        filtered = filtered.filter(t => t.completed);
        break;
    }

    // Apply search
    if (this.searchTerm) {
      filtered = filtered.filter(t =>
        t.text.toLowerCase().includes(this.searchTerm)
      );
    }

    return filtered;
  }

  render() {
    const filteredTodos = this.getFilteredTodos();

    this.todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-state';
      emptyMessage.innerHTML = `
        <p style="text-align: center; color: var(--muted); padding: 2rem;">
          ${this.searchTerm ? this.t('emptySearch') : this.t('emptyState')}
        </p>
      `;
      this.todoList.appendChild(emptyMessage);
    } else {
      filteredTodos.forEach(todo => {
        const todoElement = this.createTodoElement(todo);
        this.todoList.appendChild(todoElement);
      });
    }

    this.updateStats();
  }

  createTodoElement(todo) {
    const div = document.createElement('div');
    div.className = `todo-item ${todo.completed ? 'completed' : ''}`;

    div.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} />
      <span class="todo-text">${this.escapeHtml(todo.text)}</span>
      <div class="todo-actions">
        <button class="delete-btn">${this.t('deleteButton')}</button>
      </div>
    `;

    // Bind events
    const checkbox = div.querySelector('.todo-checkbox');
    const deleteBtn = div.querySelector('.delete-btn');

    checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
    deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

    return div;
  }

  updateStats() {
    const total = this.todos.length;
    const active = this.todos.filter(t => !t.completed).length;
    const completed = this.todos.filter(t => t.completed).length;

    this.statsElement.innerHTML = this.t('statsTemplate', { total, active, completed });
  }

  loadTodos() {
    try {
      const todos = localStorage.getItem('todos');
      return todos ? JSON.parse(todos) : [];
    } catch (e) {
      console.error('Error loading todos:', e);
      return [];
    }
  }

  saveTodos() {
    try {
      localStorage.setItem('todos', JSON.stringify(this.todos));
    } catch (e) {
      console.error('Error saving todos:', e);
    }
  }

  loadLanguage() {
    try {
      return localStorage.getItem('language') || 'th';
    } catch (e) {
      return 'th';
    }
  }

  saveLanguage() {
    try {
      localStorage.setItem('language', this.currentLanguage);
    } catch (e) {
      // Ignore
    }
  }

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'th' ? 'en' : 'th';
    this.saveLanguage();
    this.updateLanguage();
  }

  updateLanguage() {
    const t = this.translations[this.currentLanguage];

    // Update HTML lang attribute
    document.documentElement.lang = this.currentLanguage;

    // Update title and meta
    document.title = `${t.title} - Thanapon`;
    document.querySelector('meta[name="description"]').setAttribute('content',
      this.currentLanguage === 'th'
        ? 'แอปจัดการงานพร้อมกรอง ค้นหา และจัดเก็บใน LocalStorage'
        : 'Task management app with filtering, search, and local storage'
    );

    // Update header
    this.titleElement.textContent = t.title;
    this.subtitleElement.textContent = t.subtitle;
    this.backLink.textContent = t.backToHome;

    // Update language button
    this.toggleLanguageBtn.textContent = this.currentLanguage === 'th' ? '🇺🇸' : '🇹🇭';
    this.toggleLanguageBtn.setAttribute('aria-label', t.langLabel);
    this.toggleLanguageBtn.setAttribute('title', t.langTitle);

    // Update form elements
    this.newTodoInput.placeholder = t.addPlaceholder;
    this.addTodoBtn.textContent = t.addButton;
    this.searchInput.placeholder = t.searchPlaceholder;

    // Update filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons[0].textContent = t.filterAll;
    filterButtons[1].textContent = t.filterActive;
    filterButtons[2].textContent = t.filterCompleted;

    // Re-render to update all text
    this.render();
  }

  t(key, params = {}) {
    let text = this.translations[this.currentLanguage][key] || key;
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    return text;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TodoApp();
});