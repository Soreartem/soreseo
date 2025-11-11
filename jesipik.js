// jesipik.js - простая система авторизации

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
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">Войти</a></li>
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#registerModal">Регистрация</a></li>
        </ul>
    `;
}

// Регистрация
function registerUser(event) {
  event.preventDefault();

  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  // Проверяем, нет ли уже пользователя с таким email
  if (localStorage.getItem("user_" + email)) {
    alert("❌ Пользователь с таким email уже существует");
    return false;
  }

  const userData = {
    name: name,
    email: email,
    password: password,
    registeredAt: new Date().toLocaleString(),
    telegram: "",
    orders: [],
  };

  localStorage.setItem("user_" + email, JSON.stringify(userData));
  localStorage.setItem("currentUser", JSON.stringify(userData));
  currentUser = userData;

  updateNavigation();
  $("#registerModal").modal("hide");
  document.getElementById("registerForm").reset();

  alert("✅ Регистрация успешна!");

  // Если мы на странице профиля, обновляем ее
  if (window.location.pathname.includes("Profile.html")) {
    window.location.reload();
  }

  return false;
}

// Вход
function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const userData = JSON.parse(localStorage.getItem("user_" + email));

  if (userData && userData.password === password) {
    localStorage.setItem("currentUser", JSON.stringify(userData));
    currentUser = userData;

    updateNavigation();
    $("#loginModal").modal("hide");
    document.getElementById("loginForm").reset();
    alert("✅ Вход выполнен!");

    // Если мы на странице профиля, обновляем ее
    if (window.location.pathname.includes("Profile.html")) {
      window.location.reload();
    }
  } else {
    alert("❌ Неверный email или пароль");
  }

  return false;
}

// Выход
function logout() {
  localStorage.removeItem("currentUser");
  currentUser = null;
  showLoginButtons();
  alert("👋 Вы вышли из системы");

  // Если мы на странице профиля, обновляем ее
  if (window.location.pathname.includes("Profile.html")) {
    window.location.reload();
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

// Запускаем при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
  checkAuth();
  highlightActiveNav(); // Добавляем подсветку навигации

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
        alert("❌ Новые пароли не совпадают");
        return;
      }

      if (newPass.length < 6) {
        alert("❌ Пароль должен содержать минимум 6 символов");
        return;
      }

      if (changePassword(currentPass, newPass)) {
        alert("✅ Пароль успешно изменен!");
        document.getElementById("passwordForm").reset();
      } else {
        alert("❌ Текущий пароль неверен");
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

      alert("✅ Профиль обновлен!");
    });
});

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

  if (currentPage === "index.html" || currentPage === "") {
    activeLink = document.querySelector(
      'a[href="https://soreartem.github.io/soreseo/"]'
    );
  } else if (currentPage === "Pricing.html") {
    activeLink = document.querySelector('a[href="./Pricing.html"]');
  } else if (currentPage === "Otz.html") {
    activeLink = document.querySelector('a[href="./Otz.html"]');
  } else if (currentPage === "Profile.html") {
    activeLink = document.querySelector('a[href="./Profile.html"]');
  }

  // Добавляем активный класс
  if (activeLink) {
    activeLink.classList.add("active");
    activeLink.setAttribute("aria-current", "page");
  }
}
