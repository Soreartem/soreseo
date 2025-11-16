// jesipik.js - улучшенная система аккаунтов

let currentUser = null;

// Проверяем авторизацию при загрузке
function checkAuth() {
  const userData = localStorage.getItem("currentUser");
  if (userData) {
    currentUser = JSON.parse(userData);
    updateNavigation();
  } else {
    showLoginButtons();
  }
}

// Обновляем навигацию
function updateNavigation() {
  const accountDropdown = document.getElementById("accountDropdown");
  if (currentUser) {
    accountDropdown.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                👤 ${currentUser.name}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="./Profile.html">📊 Личный кабинет</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="logout()">🚪 Выйти</a></li>
            </ul>
        `;
  }
}

// Показываем кнопки входа
function showLoginButtons() {
  const accountDropdown = document.getElementById("accountDropdown");
  accountDropdown.innerHTML = `
        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
            👤 Аккаунт
        </a>
        <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">🔑 Войти</a></li>
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#registerModal">📝 Регистрация</a></li>
        </ul>
    `;
}

// Регистрация с проверкой email
function registerUser(event) {
  event.preventDefault();

  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const password = document.getElementById("regPassword").value;

  // Валидация
  if (name.length < 2) {
    showNotification("❌ Имя должно содержать минимум 2 символа", "danger");
    return false;
  }

  if (!validateEmail(email)) {
    showNotification("❌ Введите корректный email", "danger");
    return false;
  }

  if (password.length < 6) {
    showNotification("❌ Пароль должен содержать минимум 6 символов", "danger");
    return false;
  }

  // Проверяем, нет ли уже пользователя с таким email
  if (localStorage.getItem("user_" + email)) {
    showNotification("❌ Пользователь с таким email уже существует", "danger");
    return false;
  }

  const userData = {
    name: name,
    email: email,
    password: password,
    registeredAt: new Date().toLocaleString(),
    telegram: "",
    orders: [],
    emailVerified: false,
    balance: 0,
  };

  localStorage.setItem("user_" + email, JSON.stringify(userData));
  localStorage.setItem("currentUser", JSON.stringify(userData));
  currentUser = userData;

  updateNavigation();
  $("#registerModal").modal("hide");
  document.getElementById("registerForm").reset();

  showNotification(
    "✅ Регистрация успешна! Добро пожаловать, " + name + "!",
    "success"
  );

  // Если мы на странице профиля, обновляем ее
  if (window.location.pathname.includes("Profile.html")) {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  return false;
}

// Вход с проверкой
function loginUser(event) {
  event.preventDefault();

  const email = document
    .getElementById("loginEmail")
    .value.trim()
    .toLowerCase();
  const password = document.getElementById("loginPassword").value;

  const userData = JSON.parse(localStorage.getItem("user_" + email));

  if (userData && userData.password === password) {
    localStorage.setItem("currentUser", JSON.stringify(userData));
    currentUser = userData;

    updateNavigation();
    $("#loginModal").modal("hide");
    document.getElementById("loginForm").reset();

    showNotification(
      "✅ Вход выполнен! Добро пожаловать, " + userData.name + "!",
      "success"
    );

    // Если мы на странице профиля, обновляем ее
    if (window.location.pathname.includes("Profile.html")) {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  } else {
    showNotification("❌ Неверный email или пароль", "danger");
  }

  return false;
}

// Выход
function logout() {
  localStorage.removeItem("currentUser");
  currentUser = null;
  showLoginButtons();
  showNotification("👋 Вы вышли из системы", "info");

  // Если мы на странице профиля, обновляем ее
  if (window.location.pathname.includes("Profile.html")) {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}

// Функция для смены пароля
function changePassword(currentPass, newPass) {
  const userData = JSON.parse(localStorage.getItem("currentUser"));

  if (userData.password === currentPass) {
    userData.password = newPass;
    localStorage.setItem("currentUser", JSON.stringify(userData));
    localStorage.setItem("user_" + userData.email, JSON.stringify(userData));
    return true;
  }
  return false;
}

// Валидация email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Система уведомлений
function showNotification(message, type = "info") {
  // Создаем контейнер для уведомлений если его нет
  let container = document.getElementById("notifications-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "notifications-container";
    container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        `;
    document.body.appendChild(container);
  }

  const notification = document.createElement("div");
  notification.className = `alert alert-${type} alert-dismissible fade show`;
  notification.style.cssText = "margin-bottom: 10px;";
  notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  container.appendChild(notification);

  // Автоматическое скрытие через 5 секунд
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

// Функция для подсветки активной вкладки
function highlightActiveNav() {
  // Получаем текущий URL
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  // Убираем активный класс у всех ссылок
  document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
    link.classList.remove("active");
    link.removeAttribute("aria-current");
  });

  // Определяем какая страница активна
  let activeLink = null;

  if (
    currentPage === "index.html" ||
    currentPage === "" ||
    currentPage === "soreseo/"
  ) {
    activeLink = document.querySelector(
      'a[href="https://soreartem.github.io/soreseo/"]'
    );
    if (!activeLink) {
      activeLink = document.querySelector('a[href="./index.html"]');
    }
  } else if (currentPage === "Pricing.html") {
    activeLink = document.querySelector('a[href="./Pricing.html"]');
  } else if (currentPage === "Otz.html") {
    activeLink = document.querySelector('a[href="./Otz.html"]');
  } else if (currentPage === "Profile.html") {
    activeLink = document.querySelector('a[href="./Profile.html"]');
  } else if (currentPage === "Blog.html") {
    activeLink = document.querySelector('a[href="./Blog.html"]');
  } else if (currentPage === "Faq.html") {
    activeLink = document.querySelector('a[href="./Faq.html"]');
  }

  // Добавляем активный класс
  if (activeLink) {
    activeLink.classList.add("active");
    activeLink.setAttribute("aria-current", "page");
  }
}

// Запускаем при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
  checkAuth();
  highlightActiveNav();

  // Назначаем обработчики форм
  document
    .getElementById("registerForm")
    ?.addEventListener("submit", registerUser);
  document.getElementById("loginForm")?.addEventListener("submit", loginUser);

  // Обработчик формы смены пароля
  document
    .getElementById("passwordForm")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();

      const currentPass = document.getElementById("currentPassword").value;
      const newPass = document.getElementById("newPassword").value;
      const confirmPass = document.getElementById("confirmPassword").value;

      if (newPass !== confirmPass) {
        showNotification("❌ Новые пароли не совпадают", "danger");
        return;
      }

      if (newPass.length < 6) {
        showNotification(
          "❌ Пароль должен содержать минимум 6 символов",
          "danger"
        );
        return;
      }

      if (changePassword(currentPass, newPass)) {
        showNotification("✅ Пароль успешно изменен!", "success");
        document.getElementById("passwordForm").reset();
      } else {
        showNotification("❌ Текущий пароль неверен", "danger");
      }
    });

  // Обработчик формы профиля
  document
    .getElementById("profileForm")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();

      const userData = JSON.parse(localStorage.getItem("currentUser"));
      userData.name = document.getElementById("profileName").value;
      userData.telegram = document.getElementById("profileTelegram").value;

      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("user_" + userData.email, JSON.stringify(userData));

      // Обновляем навигацию
      updateNavigation();

      showNotification("✅ Профиль обновлен!", "success");
    });
});
