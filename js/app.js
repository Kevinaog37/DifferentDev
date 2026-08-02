document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-toggle");
  const menuIcon = menuButton?.querySelector("use");
  const navLinks = document.querySelector(".nav-links");
  const navigationLinks = document.querySelectorAll(".nav-links a");
  const contactForm = document.querySelector("#contact-form");
  const formMessage = document.querySelector(".form-message");

  /* Menú para móvil */
  const closeMenu = () => {
    if (!menuButton || !navLinks || !menuIcon) return;

    navLinks.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú");
    menuIcon.setAttribute("href", "#icon-menu");
  };

  menuButton?.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Cerrar menú" : "Abrir menú"
    );

    menuIcon?.setAttribute("href", isOpen ? "#icon-close" : "#icon-menu");
  });

  navigationLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    const clickedInsideMenu = navLinks?.contains(event.target);
    const clickedMenuButton = menuButton?.contains(event.target);

    if (!clickedInsideMenu && !clickedMenuButton) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 680) {
      closeMenu();
    }
  });

  /* Marca el enlace correspondiente a la sección visible */
  const sections = document.querySelectorAll("main section[id]");

  const updateActiveLink = () => {
    let currentSection = "inicio";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;

      if (window.scrollY >= sectionTop) {
        currentSection = section.id;
      }
    });

    navigationLinks.forEach((link) => {
      const isCurrentSection = link.getAttribute("href") === `#${currentSection}`;
      link.classList.toggle("active", isCurrentSection);
    });
  };

  window.addEventListener("scroll", updateActiveLink, { passive: true });
  updateActiveLink();

  /* Formulario.
     Aquí se muestra la confirmación visual.
     Para enviar correos reales conecta este bloque a Formspree,
     EmailJS o a tu propio backend. */
  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalContent = submitButton.innerHTML;

    submitButton.disabled = true;
    submitButton.innerHTML = "Enviando...";

    window.setTimeout(() => {
      formMessage.textContent =
        "¡Gracias! Recibimos tu mensaje y te contactaremos pronto.";

      contactForm.reset();
      submitButton.disabled = false;
      submitButton.innerHTML = originalContent;

      window.setTimeout(() => {
        formMessage.textContent = "";
      }, 6000);
    }, 650);
  });
});