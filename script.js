document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    // --- 0. Theme System ---
    const themeBtns = [document.getElementById('theme-toggle'), document.getElementById('mobile-theme-toggle')];
    const themeIcons = [document.getElementById('theme-icon'), document.getElementById('mobile-theme-icon')];
    const htmlEl = document.documentElement;
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlEl.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);

    themeBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                const currentTheme = htmlEl.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                htmlEl.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateThemeIcons(newTheme);
                if(window.updateThreeJSTheme) window.updateThreeJSTheme(newTheme);
            });
        }
    });

    function updateThemeIcons(theme) {
        themeIcons.forEach(icon => {
            if (!icon) return;
            if (theme === 'light') {
                icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
            } else {
                icon.innerHTML = `<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>`;
            }
        });
    }

    // --- 1. Custom Cursor ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    let hoverTargets = document.querySelectorAll('.hover-target, a, button');

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let outlineX = mouseX, outlineY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        if(cursorDot) {
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        }
    });

    function animateCursor() {
        let distX = mouseX - outlineX; let distY = mouseY - outlineY;
        outlineX += distX * 0.15; outlineY += distY * 0.15;
        if(cursorOutline) {
            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    function attachCursorEvents() {
        hoverTargets.forEach(target => {
            target.removeEventListener('mouseenter', addHoverClass);
            target.removeEventListener('mouseleave', removeHoverClass);
            target.addEventListener('mouseenter', addHoverClass);
            target.addEventListener('mouseleave', removeHoverClass);
        });
    }
    function addHoverClass() { document.body.classList.add('cursor-hover'); }
    function removeHoverClass() { document.body.classList.remove('cursor-hover'); }
    attachCursorEvents();

    // --- 2. Smooth Scroll (Lenis) ---
    const lenis = new Lenis({
        duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical', smooth: true,
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // --- 3. Back to Top & Mobile Menu ---
    const backToTopBtn = document.createElement('div');
    backToTopBtn.className = 'back-to-top hover-target';
    backToTopBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;
    document.body.appendChild(backToTopBtn);

    hoverTargets = document.querySelectorAll('.hover-target, a, button, .back-to-top');
    attachCursorEvents();

    lenis.on('scroll', (e) => {
        if (window.scrollY > 400) backToTopBtn.classList.add('visible');
        else backToTopBtn.classList.remove('visible');
    });
    backToTopBtn.addEventListener('click', () => {
        lenis.scrollTo(0, { duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    });

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobilePanel = document.getElementById('mobile-panel');
    const mobileBackdrop = document.getElementById('mobile-backdrop');
    const closeMenuBtn = document.getElementById('close-menu');

    function openMenu() {
        mobileMenu.classList.remove('pointer-events-none');
        mobileBackdrop.classList.remove('opacity-0', 'pointer-events-none');
        mobileBackdrop.classList.add('opacity-100', 'pointer-events-auto');
        mobilePanel.classList.remove('translate-x-full');
    }
    function closeMenu() {
        mobileBackdrop.classList.remove('opacity-100', 'pointer-events-auto');
        mobileBackdrop.classList.add('opacity-0', 'pointer-events-none');
        mobilePanel.classList.add('translate-x-full');
        setTimeout(() => { mobileMenu.classList.add('pointer-events-none'); }, 500);
    }

    if(mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMenu);
    if(closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    if(mobileBackdrop) mobileBackdrop.addEventListener('click', closeMenu);

    document.querySelectorAll('.nav-link, .mobile-link, a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if(targetId === '#' || !targetId.startsWith('#')) return;
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                e.preventDefault();
                if(this.classList.contains('mobile-link')) {
                    closeMenu();
                    setTimeout(() => { lenis.scrollTo(targetElement, { offset: 0, duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }); }, 300);
                } else {
                    lenis.scrollTo(targetElement, { offset: 0, duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
                }
            }
        });
    });

    // --- 4. ThreeJS Background ---
    const canvas = document.querySelector('#webgl-canvas');
    if(canvas) {
        const scene = new THREE.Scene();
        const isLight = savedTheme === 'light';
        scene.fog = new THREE.FogExp2(isLight ? 0xf5f5f5 : 0x050505, 0.0015);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        camera.position.z = 30;

        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 700;
        const posArray = new Float32Array(particlesCount * 3);
        const sizesArray = new Float32Array(particlesCount);

        for(let i = 0; i < particlesCount * 3; i+=3) {
            posArray[i] = (Math.random() - 0.5) * 100;
            posArray[i+1] = (Math.random() - 0.5) * 100;
            posArray[i+2] = (Math.random() - 0.5) * 50 - 10;
            sizesArray[i/3] = Math.random();
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeometry.setAttribute('aScale', new THREE.BufferAttribute(sizesArray, 1));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.15, color: isLight ? 0x666666 : 0xaaaaaa,
            transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, sizeAttenuation: true
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        const geomGroup = new THREE.Group();
        const geometry = new THREE.IcosahedronGeometry(1, 0);
        const geomMaterial = new THREE.MeshBasicMaterial({ 
            color: isLight ? 0x999999 : 0x333333, wireframe: true, transparent: true, opacity: 0.3
        });

        for(let i=0; i<15; i++) {
            const mesh = new THREE.Mesh(geometry, geomMaterial);
            mesh.position.set((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 30 - 10);
            mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
            const scale = Math.random() * 2 + 0.5;
            mesh.scale.set(scale, scale, scale);
            mesh.userData = { rotSpeedX: (Math.random() - 0.5) * 0.01, rotSpeedY: (Math.random() - 0.5) * 0.01, floatSpeed: Math.random() * 0.02 + 0.005, originalY: mesh.position.y };
            geomGroup.add(mesh);
        }
        scene.add(geomGroup);

        window.updateThreeJSTheme = function(theme) {
            if (theme === 'light') {
                scene.fog.color.setHex(0xf5f5f5); particlesMaterial.color.setHex(0x666666); geomMaterial.color.setHex(0x999999);
            } else {
                scene.fog.color.setHex(0x050505); particlesMaterial.color.setHex(0xaaaaaa); geomMaterial.color.setHex(0x333333);
            }
        };

        let mouseTargetX = 0, mouseTargetY = 0;
        const windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (event) => {
            mouseTargetX = (event.clientX - windowHalfX) * 0.005;
            mouseTargetY = (event.clientY - windowHalfY) * 0.005;
        });

        const clock = new THREE.Clock();
        function animateThree() {
            const elapsedTime = clock.getElapsedTime();
            particlesMesh.rotation.y = elapsedTime * 0.05; particlesMesh.rotation.x = elapsedTime * 0.02;
            geomGroup.children.forEach(mesh => {
                mesh.rotation.x += mesh.userData.rotSpeedX; mesh.rotation.y += mesh.userData.rotSpeedY;
                mesh.position.y = mesh.userData.originalY + Math.sin(elapsedTime * mesh.userData.floatSpeed * 10) * 2;
            });
            camera.position.x += (mouseTargetX - camera.position.x) * 0.05;
            camera.position.y += (-mouseTargetY - camera.position.y) * 0.05;
            camera.lookAt(scene.position);
            renderer.render(scene, camera);
            requestAnimationFrame(animateThree);
        }
        animateThree();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

   // --- 5. Content & GSAP ---
    const tlLoader = gsap.timeline();
    tlLoader.to('.loader-bar', { width: '100%', duration: 1.5, ease: 'power3.inOut' })
    .to('.loader-text span', { y: '-100%', duration: 0.8, ease: 'power3.in' }, "-=0.2")
    .to('#loader', { yPercent: -100, duration: 1, ease: 'power4.inOut' })
    .to('.hero-title-part', { y: '0%', duration: 1.2, stagger: 0.1, ease: 'power4.out' }, "-=0.5")
    .to('.hero-subtext', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, "-=0.8")
    .to('.hero-desc', { opacity: 1, duration: 1, ease: 'power3.out' }, "-=0.8")
    .fromTo('.scroll-indicator', { opacity: 0, y: 20 }, { opacity: 0.5, y: 0, duration: 1, ease: 'power3.out' }, "-=0.5");

    const aboutText = document.querySelector('.about-text');
    if(aboutText) {
        const words = aboutText.innerHTML.split(/(<[^>]*>| |\n)/).filter(Boolean);
        aboutText.innerHTML = '';
        words.forEach(word => {
            if(word.startsWith('<') || word.trim() === '') aboutText.innerHTML += word;
            else aboutText.innerHTML += `<span style="display:inline-block; overflow:hidden; vertical-align:bottom;"><span class="about-word" style="display:inline-block; transform:translateY(100%);">${word}</span></span>`;
        });
        gsap.to('.about-word', { scrollTrigger: { trigger: '#about', start: 'top 75%' }, y: '0%', duration: 1, stagger: 0.02, ease: 'power3.out' });
    }

    gsap.fromTo('.about-subtext', { opacity: 0, y: 30 }, { scrollTrigger: { trigger: '#about', start: 'top 60%' }, opacity: 1, y: 0, duration: 1, delay: 0.3, ease: 'power3.out' });
    
    // أنيميشن قسم المهارات الجديد
    const skillBars = document.querySelectorAll('.skill-progress');
    if(skillBars.length > 0) {
        skillBars.forEach(bar => {
            gsap.to(bar, {
                scrollTrigger: {
                    trigger: bar.parentElement,
                    start: 'top 90%',
                },
                width: bar.getAttribute('data-width'),
                duration: 1.5,
                ease: 'power4.out'
            });
        });
    }

    // أنيميشن كروت المهارات (دخول ناعم)
    const skillsRows = document.querySelectorAll('.skills-grid > div');
    if(skillsRows.length > 0) {
        gsap.fromTo(skillsRows, 
            { opacity: 0, y: 40 },
            { scrollTrigger: { trigger: '.skills-grid', start: 'top 80%' }, opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
        );
    }

    // أنيميشن شجرة الجافاسكريبت المذهلة
    const jsTree = document.querySelector('.js-tree-wrapper');
    const treeLines = document.querySelectorAll('.tree-line');
    const treeArrows = document.querySelectorAll('.tree-arrow');
    const jsNodes = document.querySelectorAll('.js-node');

    if(jsTree) {
        let tlTree = gsap.timeline({
            scrollTrigger: {
                trigger: jsTree,
                start: 'top 70%',
            }
        });

        // رسم الخطوط
        tlTree.to(treeLines, {
            strokeDashoffset: 0,
            duration: 1.5,
            ease: 'power2.inOut'
        })
        // إظهار رؤوس الأسهم
        .to(treeArrows, {
            opacity: 1,
            duration: 0.3
        }, "-=0.3")
        // دخول الكروت السفلية
        .fromTo(jsNodes, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)' },
            "-=0.2"
        );
    }

    const extrasGrid = document.querySelector('.extras-grid');
    if(extrasGrid) {
        gsap.fromTo(extrasGrid.children, 
            { opacity: 0, y: 30 },
            { scrollTrigger: { trigger: extrasGrid, start: 'top 80%' }, opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out' }
        );
    }

    const projects = document.querySelectorAll('.project-card');
    projects.forEach((proj) => { gsap.fromTo(proj, { opacity: 0, y: 50 }, { scrollTrigger: { trigger: proj, start: 'top 85%' }, opacity: 1, y: 0, duration: 1, ease: 'power3.out' }); });

    const labels = document.querySelectorAll('.section-label');
    labels.forEach(label => { gsap.to(label, { scrollTrigger: { trigger: label.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 }, y: 50, ease: 'none' }); });
    // --- 6. Journey Timeline ---
    const timelineContainer = document.querySelector('.timeline-wrapper');
    const progressLine = document.querySelector('.timeline-progress');
    const timelineItems = document.querySelectorAll('.timeline-item');

    if(timelineContainer && progressLine) {
        gsap.to(progressLine, { scrollTrigger: { trigger: timelineContainer, start: 'top 50%', end: 'bottom 50%', scrub: 1 }, height: '100%', ease: 'none' });

        timelineItems.forEach((item) => {
            const contentLeft = item.querySelector('.slide-from-left');
            const contentRight = item.querySelector('.slide-from-right');
            const icon = item.querySelector('.timeline-icon');

            if (contentLeft) {
                gsap.fromTo(contentLeft, { opacity: 0, x: -50 }, { scrollTrigger: { trigger: item, start: 'top 75%', end: 'bottom 20%', toggleActions: 'play none none reverse' }, opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' });
            }
            if (contentRight) {
                gsap.fromTo(contentRight, { opacity: 0, x: 50 }, { scrollTrigger: { trigger: item, start: 'top 75%', end: 'bottom 20%', toggleActions: 'play none none reverse' }, opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' });
            }

            ScrollTrigger.create({
                trigger: item, start: 'top 50%',
                onEnter: () => {
                    icon.classList.add('border-foreground', 'text-foreground', 'shadow-[0_0_15px_var(--text-main)]');
                    icon.classList.remove('border-[var(--glass-border)]', 'text-[var(--text-muted)]', 'shadow-[var(--glass-shadow)]');
                },
                onLeaveBack: () => {
                    icon.classList.remove('border-foreground', 'text-foreground', 'shadow-[0_0_15px_var(--text-main)]');
                    icon.classList.add('border-[var(--glass-border)]', 'text-[var(--text-muted)]', 'shadow-[var(--glass-shadow)]');
                }
            });
        });
    }

    // --- 7. Development Timeline ---
    const devTimelineContainer = document.querySelector('.dev-timeline-wrapper');
    const devProgressLine = document.querySelector('.dev-timeline-progress');
    const devTimelineItems = document.querySelectorAll('.dev-timeline-item');

    if(devTimelineContainer && devProgressLine) {
        gsap.to(devProgressLine, {
            scrollTrigger: { trigger: devTimelineContainer, start: 'top 50%', end: 'bottom 50%', scrub: 1 },
            height: '100%', ease: 'none'
        });

        devTimelineItems.forEach((item) => {
            const contentLeft = item.querySelector('.dev-slide-from-left');
            const contentRight = item.querySelector('.dev-slide-from-right');
            const icon = item.querySelector('.dev-timeline-icon');

            if (contentLeft) {
                gsap.fromTo(contentLeft, { opacity: 0, x: -60 }, { scrollTrigger: { trigger: item, start: 'top 80%', end: 'bottom 20%', toggleActions: 'play none none reverse' }, opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' });
            }
            if (contentRight) {
                gsap.fromTo(contentRight, { opacity: 0, x: 60 }, { scrollTrigger: { trigger: item, start: 'top 80%', end: 'bottom 20%', toggleActions: 'play none none reverse' }, opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' });
            }

            ScrollTrigger.create({
                trigger: item, start: 'top 50%',
                onEnter: () => {
                    icon.classList.add('border-foreground', 'text-foreground', 'shadow-[0_0_15px_var(--text-main)]');
                    icon.classList.remove('border-[var(--glass-border)]', 'text-[var(--text-muted)]', 'shadow-[var(--glass-shadow)]');
                },
                onLeaveBack: () => {
                    icon.classList.remove('border-foreground', 'text-foreground', 'shadow-[0_0_15px_var(--text-main)]');
                    icon.classList.add('border-[var(--glass-border)]', 'text-[var(--text-muted)]', 'shadow-[var(--glass-shadow)]');
                }
            });
        });
    }

    // --- 8. Activities & Leadership Animation ---
    const leadershipCards = document.querySelectorAll('.leadership-card');
    if (leadershipCards.length > 0) {
        gsap.fromTo(leadershipCards,
            { opacity: 0, y: 50 },
            {
                scrollTrigger: {
                    trigger: '.leadership-cards-wrapper',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out'
            }
        );
    }
});