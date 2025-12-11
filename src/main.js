document.addEventListener("DOMContentLoaded", () => {

  // --- 1. Плавный скролл (Lenis) ---
  const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smooth: true,
      smoothTouch: false
  });

  function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // --- 2. Three.js: Нейросетевая сфера (Particles) ---
  const initThreeJS = () => {
      const container = document.getElementById('canvas-container');
      if (!container) return;

      // Создаем сцену
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 2.5;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);

      // Геометрия
      const geometry = new THREE.BufferGeometry();
      const count = 1800;
      const posArray = new Float32Array(count * 3);

      for(let i = 0; i < count * 3; i++) {
          const r = 1.2 + Math.random() * 0.5;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);

          const x = r * Math.sin(phi) * Math.cos(theta);
          const y = r * Math.sin(phi) * Math.sin(theta);
          const z = r * Math.cos(phi);

          posArray[i] = x;
          posArray[i+1] = y;
          posArray[i+2] = z;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const material = new THREE.PointsMaterial({
          size: 0.008,
          color: 0x3b82f6,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending
      });

      const particlesMesh = new THREE.Points(geometry, material);
      scene.add(particlesMesh);

      // Интерактив с мышью
      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;

      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;

      document.addEventListener('mousemove', (event) => {
          mouseX = (event.clientX - windowHalfX);
          mouseY = (event.clientY - windowHalfY);
      });

      const animate = () => {
          requestAnimationFrame(animate);

          targetX = mouseX * 0.0005;
          targetY = mouseY * 0.0005;

          particlesMesh.rotation.y += 0.002;
          particlesMesh.rotation.x += 0.001;

          // Плавное следование за курсором
          particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
          particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

          renderer.render(scene, camera);
      };
      animate();

      window.addEventListener('resize', () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
      });
  };

  if (window.innerWidth > 768) {
      initThreeJS();
  }

  // --- 3. GSAP Animations ---
  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline();
  tl.from(".header", { y: -50, opacity: 0, duration: 1, ease: "power3.out" })
    .from(".badge", { y: 20, opacity: 0, duration: 0.8 }, "-=0.5")
    .from(".hero__title", { y: 50, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.6")
    .from(".hero__subtitle", { y: 30, opacity: 0, duration: 0.8 }, "-=0.6")
    .from(".hero__btns", { y: 20, opacity: 0, duration: 0.8 }, "-=0.6");

  gsap.utils.toArray('.section').forEach(section => {
      const title = section.querySelector('.section__title');
      const desc = section.querySelector('.section__desc');

      if (title) {
          gsap.from(title, {
              scrollTrigger: { trigger: section, start: "top 85%" },
              y: 40, opacity: 0, duration: 0.8, ease: "power2.out"
          });
      }
      if (desc) {
          gsap.from(desc, {
              scrollTrigger: { trigger: section, start: "top 85%" },
              y: 30, opacity: 0, duration: 0.8, delay: 0.1, ease: "power2.out"
          });
      }
  });

  gsap.utils.toArray('.card').forEach((card, i) => {
      gsap.from(card, {
          scrollTrigger: { trigger: card.parentElement, start: "top 80%" },
          y: 50, opacity: 0, duration: 0.6, delay: i * 0.1
      });
  });

  gsap.utils.toArray('.blog-card').forEach((card, i) => {
      gsap.from(card, {
          scrollTrigger: { trigger: card.parentElement, start: "top 80%" },
          y: 50, opacity: 0, duration: 0.6, delay: i * 0.1
      });
  });

  // --- 4. Хедер и Меню ---
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
          header.classList.add('scrolled');
      } else {
          header.classList.remove('scrolled');
      }
  });

  const burger = document.querySelector('.burger-menu');
  const nav = document.querySelector('.nav');
  const navLinks = document.querySelectorAll('.nav__link');

  const toggleMenu = () => {
      nav.classList.toggle('open');
      burger.classList.toggle('active');
      const spans = burger.querySelectorAll('span');
      if (nav.classList.contains('open')) {
          spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
          spans[1].style.opacity = '0';
          spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
          spans[0].style.transform = 'none';
          spans[1].style.opacity = '1';
          spans[2].style.transform = 'none';
      }
  };

  burger.addEventListener('click', toggleMenu);
  navLinks.forEach(link => {
      link.addEventListener('click', () => {
          if (nav.classList.contains('open')) toggleMenu();
      });
  });

  // --- 5. Форма и Капча ---
  const form = document.getElementById('mainForm');
  const msg = document.getElementById('formMessage');
  const phoneInput = document.getElementById('phone');
  const captchaSpan = document.getElementById('captcha-question');
  const captchaInput = document.getElementById('captcha-answer');

  let num1 = Math.floor(Math.random() * 10);
  let num2 = Math.floor(Math.random() * 10);
  captchaSpan.textContent = `${num1} + ${num2} = ?`;

  phoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
  });

  form.addEventListener('submit', (e) => {
      e.preventDefault();

      const correctAnswer = num1 + num2;
      if (parseInt(captchaInput.value) !== correctAnswer) {
          msg.textContent = "Ошибка: Неверное решение примера.";
          msg.className = "form-message error";
          captchaInput.style.borderColor = "red";
          setTimeout(() => captchaInput.style.borderColor = "rgba(255,255,255,0.05)", 2000);
          return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      btn.textContent = "Отправка...";
      btn.disabled = true;
      btn.style.opacity = "0.7";

      setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.opacity = "1";

          msg.textContent = "Спасибо! Ваша заявка успешно отправлена.";
          msg.className = "form-message success";

          form.reset();

          num1 = Math.floor(Math.random() * 10);
          num2 = Math.floor(Math.random() * 10);
          captchaSpan.textContent = `${num1} + ${num2} = ?`;

          setTimeout(() => {
              msg.textContent = "";
              msg.className = "form-message";
          }, 5000);
      }, 1500);
  });

  // --- 6. Cookies ---
  const cookiePopup = document.getElementById('cookiePopup');
  const acceptBtn = document.getElementById('acceptCookies');

  if (!localStorage.getItem('cookiesAccepted')) {
      setTimeout(() => {
          cookiePopup.classList.add('show');
      }, 2000);
  }

  acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookiesAccepted', 'true');
      cookiePopup.classList.remove('show');
  });
});