'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initCookies();
  initLocalStorage();
  initSessionStorage();
  initIndexedDB();
  initCacheAPI();
  initServiceWorker();
});

// Helpers

function $(id) {
  return document.getElementById(id);
}

function showResult(elementId, message, isError = false) {
  const element = $(elementId);

  if (!element) {
    console.log(message);
    return;
  }

  element.textContent = message;
  element.classList.toggle('error', isError);
}

function formatDate(date) {
  return new Intl
      .DateTimeFormat('ru-RU', {dateStyle: 'short', timeStyle: 'medium'})
      .format(date);
}

function getCookieParams() {
  const keyInput = $('cookie-key');
  const valueInput = $('cookie-value');

  const name = keyInput ? encodeURIComponent(keyInput.value.trim()) : '';
  const value = valueInput ? encodeURIComponent(valueInput.value.trim()) : '';

  let query = '';
  if (name) query += `?name=${name}`;
  if (value) query += `${query ? '&' : '?'}value=${value}`;
  return query;
}

// 1. Cookies
function initCookies() {
  const resultId = 'cookie-result';
  showResult(resultId, 'Cookie ещё не проверялась.');

  const setButton = $('cookie-set');
  const checkButton = $('cookie-check');
  const deleteButton = $('cookie-delete');
  const clearButton = $('cookie-clear');

  if (!setButton || !checkButton || !deleteButton) {
    return;
  }

  setButton.addEventListener('click', async () => {
    try {
      const query = getCookieParams();
      const response = await fetch(
          `/api/cookie/set${query}`,
          {method: 'POST', credentials: 'same-origin'});
      const message = await response.text();

      if (!response.ok) {
        throw new Error(message);
      }

      showResult(resultId, `${message}\nЗащищена флагом HttpOnly.`);
    } catch (error) {
      showResult(resultId, `Ошибка: ${error.message}`, true);
    }
  });

  checkButton.addEventListener('click', async () => {
    try {
      const keyInput = $('cookie-key');
      const name = keyInput ? encodeURIComponent(keyInput.value.trim()) : '';
      const query = name ? `?name=${name}` : '';

      const response = await fetch(
          `/api/cookie/check${query}`, {credentials: 'same-origin'});
      const message = await response.text();

      if (!response.ok) {
        throw new Error(message);
      }

      showResult(resultId, `${message}\nСервер успешно прочитал cookie.`);
    } catch (error) {
      showResult(resultId, `Ошибка: ${error.message}`, true);
    }
  });

  deleteButton.addEventListener('click', async () => {
    try {
      const keyInput = $('cookie-key');
      const name = keyInput ? encodeURIComponent(keyInput.value.trim()) : '';
      const query = name ? `?name=${name}` : '';

      const response = await fetch(
          `/api/cookie/delete${query}`,
          {method: 'POST', credentials: 'same-origin'});
      const message = await response.text();

      if (!response.ok) {
        throw new Error(message);
      }

      showResult(resultId, message);
    } catch (error) {
      showResult(resultId, `Ошибка: ${error.message}`, true);
    }
  });

  clearButton.addEventListener('click', async () => {
    try {
      const response = await fetch(
          '/api/cookie/clear', {method: 'POST', credentials: 'same-origin'});

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message);
      }

      showResult(resultId, message);
    } catch (error) {
      showResult(resultId, `Ошибка: ${error.message}`, true);
    }
  });
}

// 2. LocalStorage
function initLocalStorage() {
  const keyInput = $('local-key');
  const valueInput = $('local-value');
  const saveButton = $('local-save');
  const readButton = $('local-read');
  const deleteButton = $('local-delete');
  const clearButton = $('local-clear');

  if (!keyInput || !valueInput || !saveButton) {
    return;
  }

  function renderLocalStorage() {
    const list = $('local-list');

    if (!list) {
      return;
    }

    list.replaceChildren();

    if (localStorage.length === 0) {
      list.textContent = 'Хранилище пусто.';
      return;
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);

      const item = document.createElement('li');
      item.textContent = `${key}: ${value}`;
      list.appendChild(item);
    }
  }

  saveButton.addEventListener('click', () => {
    const key = keyInput.value.trim();
    const value = valueInput.value;

    if (!key) {
      showResult('local-result', 'Введите ключ.', true);
      return;
    }

    try {
      localStorage.setItem(key, value);
      showResult('local-result', `Сохранено: ${key} = ${value}`);
      renderLocalStorage();
    } catch (error) {
      showResult('local-result', `Ошибка: ${error.message}`, true);
    }
  });

  if (readButton) {
    readButton.addEventListener('click', () => {
      const key = keyInput.value.trim();

      if (!key) {
        showResult('local-result', 'Введите ключ.', true);
        return;
      }

      const value = localStorage.getItem(key);

      if (value === null) {
        showResult('local-result', `Ключ '${key}' не найден.`, true);
      } else {
        showResult('local-result', `Прочитано: ${key} = ${value}`);
      }
    });
  }

  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      const key = keyInput.value.trim();

      if (!key) {
        showResult('local-result', 'Введите ключ.', true);
        return;
      }

      localStorage.removeItem(key);
      showResult('local-result', `Ключ '${key}' удалён.`);
      renderLocalStorage();
    });
  }

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      localStorage.clear();
      showResult('local-result', 'LocalStorage очищен.');
      renderLocalStorage();
    });
  }

  showResult('local-result', 'Готово к работе.');
  renderLocalStorage();
}

// 3. SessionStorage
function initSessionStorage() {
  const keyInput = $('session-key');
  const valueInput = $('session-value');
  const saveButton = $('session-save');
  const readButton = $('session-read');
  const deleteButton = $('session-delete');
  const clearButton = $('session-clear');

  if (!keyInput || !valueInput || !saveButton) {
    return;
  }

  function renderSessionStorage() {
    const list = $('session-list');

    if (!list) {
      return;
    }

    list.replaceChildren();

    if (sessionStorage.length === 0) {
      list.textContent = 'Хранилище пусто.';
      return;
    }

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);

      const item = document.createElement('li');
      item.textContent = `${key}: ${value}`;
      list.appendChild(item);
    }
  }

  saveButton.addEventListener('click', () => {
    const key = keyInput.value.trim();

    if (!key) {
      showResult('session-result', 'Введите ключ.', true);
      return;
    }

    try {
      sessionStorage.setItem(key, valueInput.value);
      showResult('session-result', `Сохранено в текущей вкладке: ${key}`);
      renderSessionStorage();
    } catch (error) {
      showResult('session-result', `Ошибка: ${error.message}`, true);
    }
  });

  if (readButton) {
    readButton.addEventListener('click', () => {
      const key = keyInput.value.trim();

      if (!key) {
        showResult('session-result', 'Введите ключ.', true);
        return;
      }

      const value = sessionStorage.getItem(key);

      if (value === null) {
        showResult(
            'session-result', `Ключ '${key}' не найден в текущей вкладке.`,
            true);
      } else {
        showResult('session-result', `Прочитано: ${value}`);
      }
    });
  }

  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      const key = keyInput.value.trim();

      if (!key) {
        showResult('session-result', 'Введите ключ.', true);
        return;
      }

      sessionStorage.removeItem(key);
      showResult('session-result', `Ключ '${key}' удалён.`);
      renderSessionStorage();
    });
  }

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      sessionStorage.clear();
      showResult('session-result', 'SessionStorage очищен.');
      renderSessionStorage();
    });
  }

  showResult('session-result', 'Готово к работе.');
  renderSessionStorage();
}

// 4. IndexedDB

const IDB_NAME = 'BrowserStorageLab';
const IDB_VERSION = 1;
const IDB_STORE = 'notes';

function openNotesDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB не поддерживается браузером.'));
      return;
    }

    const request = indexedDB.open(IDB_NAME, IDB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, {keyPath: 'id', autoIncrement: true});
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
        reject(request.error || new Error('Не удалось открыть IndexedDB.'));
  });
}

async function initIndexedDB() {
  const saveButton = $('idb-save');
  const listButton = $('idb-list');
  const clearButton = $('idb-clear');
  const textInput = $('idb-text');

  if (!saveButton || !textInput) {
    return;
  }

  saveButton.addEventListener('click', async () => {
    const text = textInput.value.trim();

    if (!text) {
      showResult('idb-result', 'Введите текст заметки.', true);
      return;
    }

    let db;

    try {
      db = await openNotesDB();

      await new Promise((resolve, reject) => {
        const transaction = db.transaction(IDB_STORE, 'readwrite');

        transaction.objectStore(IDB_STORE).add(
            {text, createdAt: new Date().toISOString()});

        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });

      textInput.value = '';
      showResult('idb-result', 'Заметка сохранена в IndexedDB.');
      await renderIndexedDBNotes();
    } catch (error) {
      showResult('idb-result', `Ошибка: ${error.message}`, true);
    } finally {
      if (db) db.close();
    }
  });

  if (listButton) {
    listButton.addEventListener('click', renderIndexedDBNotes);
  }

  if (clearButton) {
    clearButton.addEventListener('click', async () => {
      let db;

      try {
        db = await openNotesDB();

        await new Promise((resolve, reject) => {
          const transaction = db.transaction(IDB_STORE, 'readwrite');
          transaction.objectStore(IDB_STORE).clear();

          transaction.oncomplete = resolve;
          transaction.onerror = () => reject(transaction.error);
          transaction.onabort = () => reject(transaction.error);

          //   const request = indexedDB.deleteDatabase(IDB_NAME);
          //   request.onsuccess = () => resolve();
          //   request.onerror = () => reject(request.error);
          //   request.onblocked = () => {
          //     resolve();
          //   };
        });

        showResult('idb-result', 'Все заметки удалены.');
        await renderIndexedDBNotes();
      } catch (error) {
        showResult('idb-result', `Ошибка: ${error.message}`, true);
      } finally {
        if (db) db.close();
      }
    });
  }

  showResult('idb-result', 'Заметки будут сохранены в IndexedDB.');
  await renderIndexedDBNotes();
}

async function renderIndexedDBNotes() {
  const list = $('idb-list-output');

  if (!list) {
    return;
  }

  let db;

  try {
    db = await openNotesDB();

    const notes = await new Promise((resolve, reject) => {
      const transaction = db.transaction(IDB_STORE, 'readonly');
      const request = transaction.objectStore(IDB_STORE).getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    list.replaceChildren();

    if (notes.length === 0) {
      list.textContent = 'Заметок пока нет.';
      return;
    }

    for (const note of notes) {
      const item = document.createElement('li');
      item.textContent = `#${note.id} — ${note.text} (${
          formatDate(new Date(note.createdAt))})`;
      list.appendChild(item);
    }
  } catch (error) {
    showResult('idb-result', `Ошибка: ${error.message}`, true);
  } finally {
    if (db) db.close();
  }
}

// 5. Cache API

const DEMO_CACHE_NAME = 'browser-storage-lab-demo-v1';

async function initCacheAPI() {
  const saveButton = $('cache-save');
  const readButton = $('cache-read');
  const deleteButton = $('cache-delete');
  const urlInput = $('cache-url');
  const textInput = $('cache-text');
  const clearButton = $('cache-clear');

  if (!saveButton || !readButton || !deleteButton || !urlInput || !textInput) {
    return;
  }

  saveButton.addEventListener('click', async () => {
    if (!('caches' in window)) {
      showResult('cache-result', 'Cache API не поддерживается.', true);
      return;
    }

    const customUrl = urlInput.value.trim();
    const customText = textInput.value;

    if (!customUrl) {
      showResult('cache-result', 'Введите URL или ключ для кэша.', true);
      return;
    }

    try {
      const cache = await caches.open(DEMO_CACHE_NAME);
      const request = new Request(customUrl);
      const response = new Response(
          `Содержимое: ${customText}\nСохранено: ${formatDate(new Date())}`,
          {headers: {'Content-Type': 'text/plain; charset=utf-8'}});

      await cache.put(request, response);

      showResult(
          'cache-result', `Успешно сохранено в кэш!\nКлюч (URL): ${customUrl}`);
    } catch (error) {
      showResult('cache-result', `Ошибка: ${error.message}`, true);
    }
  });

  readButton.addEventListener('click', async () => {
    const customUrl = urlInput.value.trim();
    if (!customUrl) {
      showResult('cache-result', 'Введите URL для поиска в кэше.', true);
      return;
    }

    try {
      const cache = await caches.open(DEMO_CACHE_NAME);
      const response = await cache.match(customUrl);

      if (!response) {
        showResult(
            'cache-result', `Запись по адресу "${customUrl}" не найдена.`,
            true);
        return;
      }

      const text = await response.text();
      showResult(
          'cache-result', `Прочитано из кэша для "${customUrl}":\n\n${text}`);
    } catch (error) {
      showResult('cache-result', `Ошибка: ${error.message}`, true);
    }
  });

  deleteButton.addEventListener('click', async () => {
    const customUrl = urlInput.value.trim();
    if (!customUrl) {
      showResult('cache-result', 'Введите URL для удаления.', true);
      return;
    }

    try {
      const cache = await caches.open(DEMO_CACHE_NAME);
      const deleted = await cache.delete(customUrl);

      showResult(
          'cache-result',
          deleted ? `Запись "${customUrl}" удалена из кэша.` :
                    `Запись "${customUrl}" не найдена.`);
    } catch (error) {
      showResult('cache-result', `Ошибка: ${error.message}`, true);
    }
  });

  clearButton.addEventListener('click', async () => {
    if (!('caches' in window)) {
      showResult('cache-result', 'Cache API не поддерживается.', true);
      return;
    }

    try {
      const deleted = await caches.delete(DEMO_CACHE_NAME);
      showResult(
          'cache-result',
          deleted ? 'Демо кэш полностью очищен.' : 'Кэш уже пуст.');
    } catch (error) {
      showResult('cache-result', `Ошибка: ${error.message}`, true);
    }
  });
}

// 6. Service Worker

async function initServiceWorker() {
  const registerButton = $('sw-register');
  const statusButton = $('sw-status');
  const unregisterButton = $('sw-unregister');

  if (!registerButton || !statusButton || !unregisterButton) {
    return;
  }

  if (!('serviceWorker' in navigator)) {
    showResult(
        'sw-result', 'Service Worker не поддерживается этим браузером.', true);

    registerButton.disabled = true;
    statusButton.disabled = true;
    unregisterButton.disabled = true;
    return;
  }

  registerButton.addEventListener('click', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');

      showResult(
          'sw-result',
          'Service Worker зарегистрирован.\n' +
              `Scope: ${registration.scope}\n` +
              'При первом запуске браузеру может потребоваться время на активацию.');

      await updateServiceWorkerStatus();
    } catch (error) {
      showResult('sw-result', `Ошибка регистрации: ${error.message}`, true);
    }
  });

  statusButton.addEventListener('click', updateServiceWorkerStatus);

  unregisterButton.addEventListener('click', async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();

      if (registrations.length === 0) {
        showResult('sw-result', 'Зарегистрированных Service Worker нет.');
        return;
      }

      const results = await Promise.all(
          registrations.map(registration => registration.unregister()));

      const count = results.filter(Boolean).length;

      showResult('sw-result', `Отменена регистрация Service Worker: ${count}.`);
    } catch (error) {
      showResult('sw-result', `Ошибка: ${error.message}`, true);
    }
  });

  showResult('sw-result', 'Статус Service Worker будет показан здесь.');
  await updateServiceWorkerStatus();
}

async function updateServiceWorkerStatus() {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();

    if (registrations.length === 0) {
      showResult('sw-result', 'Service Worker не зарегистрирован.');
      return;
    }

    const lines = registrations.map((registration, index) => {
      let state = 'ожидает установки';

      if (registration.active) {
        state = `активен (${registration.active.state})`;
      } else if (registration.installing) {
        state = `устанавливается (${registration.installing.state})`;
      } else if (registration.waiting) {
        state = `ожидает активации (${registration.waiting.state})`;
      }

      return `${index + 1}. ${state}\nScope: ${registration.scope}`;
    });

    showResult('sw-result', lines.join('\n\n'));
  } catch (error) {
    showResult('sw-result', `Ошибка: ${error.message}`, true);
  }
}
