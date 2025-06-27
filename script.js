document.addEventListener('DOMContentLoaded', () => {
    // Referensi Elemen DOM
    const giftAnimationContainer = document.getElementById('gift-animation-container');
    const giftImage = document.getElementById('gift-image');
    const messageContainer = document.getElementById('message-container');
    const dynamicMessage = document.getElementById('dynamic-message');
    const paperMessageContainer = document.getElementById('paper-message-container');
    const paperTextContent = document.getElementById('paper-text-content');
    const mapContainer = document.getElementById('map-container'); // Kontainer untuk Three.js canvas
    const quizContainer = document.getElementById('quiz-container');
    const finalPrizeContainer = document.getElementById('final-prize-container');
    const giftAnimationContainer = document.getElementById('gift-animation-container'); // Ditambahkan untuk event listener animasi
    // submitQuizButton akan diinisialisasi ulang saat kuis dibuat
    // const pins = document.querySelectorAll('.map-pin'); // Pin HTML lama tidak digunakan lagi

    // State aplikasi
    let currentStep = 0; // 0: initial, 1: gift fallen, 2: paper shown, 3: map/globe shown, 4: quiz shown

    // Three.js global variables
    let scene, camera, renderer, globe, controls;
    let threeJSInitialized = false;

    // Fungsi utilitas untuk menampilkan/menyembunyikan elemen
    function showElement(element, displayStyle = 'block') {
        element.style.display = displayStyle;
    }

    function hideElement(element) {
        element.style.display = 'none';
    }

    // Inisialisasi: Sembunyikan semua kecuali animasi kado
    hideElement(messageContainer);
    hideElement(paperMessageContainer);
    hideElement(mapContainer);
    hideElement(quizContainer);
    hideElement(finalPrizeContainer);

    // Fase 1: Animasi Kado dan Pesan Awal
    if (giftAnimationContainer) { // Pastikan elemen ada
        giftAnimationContainer.addEventListener('animationend', () => {
            console.log("Animasi kado (gift-animation-container) selesai.");
            dynamicMessage.textContent = "klik mana saja untuk melihat";
            showElement(messageContainer);
            currentStep = 1;
        });
    } else {
        console.error("#gift-animation-container tidak ditemukan. Tidak bisa melampirkan event animationend.");
        // Fallback darurat jika animasi tidak terdeteksi, langsung ke step 1 setelah delay singkat
        // Ini hanya untuk memastikan alur bisa lanjut jika ada masalah dengan deteksi animasi
        setTimeout(() => {
            if (currentStep === 0) { // Hanya jika belum ada interaksi
                 console.warn("Fallback: Lanjut ke step 1 karena animasi mungkin tidak terdeteksi.");
                 dynamicMessage.textContent = "klik mana saja untuk melihat";
                 showElement(messageContainer);
                 currentStep = 1;
            }
        }, 2500); // Sedikit lebih lama dari durasi animasi (2s)
    }


    document.body.addEventListener('click', (event) => {
        // Pastikan klik tidak berasal dari elemen interaktif di dalam kontainer yang sudah aktif
        if (currentStep === 4 && (quizContainer.contains(event.target) || event.target === submitQuizButton)) {
            return; // Jangan proses klik global jika sedang di dalam kuis
        }
        if (currentStep === 3 && mapContainer.contains(event.target) && event.target.classList.contains('map-pin')) {
             // Ditangani oleh event listener pin
            return;
        }


        switch (currentStep) {
            case 1: // Setelah kado jatuh, "klik mana saja untuk melihat"
                console.log("Klik setelah kado jatuh");
                hideElement(giftAnimationContainer); // Sembunyikan kado setelah pesan pertama
                paperTextContent.textContent = "Hadiah telah hilang... Temukan dengan selesaikan teka-tekinya!";
                showElement(paperMessageContainer);
                dynamicMessage.textContent = "klik mana saja untuk melanjutkan";
                currentStep = 2;
                break;
            case 2: // Setelah pesan kertas muncul, "klik mana saja untuk melanjutkan"
                console.log("Klik setelah pesan kertas");
                hideElement(paperMessageContainer);
                hideElement(messageContainer);
                if (!threeJSInitialized) {
                    initThreeJS(); // Panggil inisialisasi Three.js di sini
                    threeJSInitialized = true;
                }
                showElement(mapContainer);
                // Sembunyikan giftAnimationContainer jika masih terlihat
                hideElement(giftAnimationContainer);
                dynamicMessage.textContent = ""; // Kosongkan pesan umum
                currentStep = 3; // map/globe is shown
                break;
            // Kasus lain bisa ditambahkan jika diperlukan alur klik global tambahan
        }
    });

    function initThreeJS() {
        // Scene
        scene = new THREE.Scene();

        // Camera
        const fov = 75;
        const aspect = mapContainer.clientWidth / mapContainer.clientHeight;
        const near = 0.1;
        const far = 1000;
        camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.z = 5; // Atur posisi kamera agar globe terlihat

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha:true agar background CSS bisa terlihat jika mau
        renderer.setSize(mapContainer.clientWidth, mapContainer.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mapContainer.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Cahaya lembut dari semua arah
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Cahaya dari satu arah
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        // OrbitControls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Memberikan efek 'kelembaman' saat memutar
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false; // true untuk pan di screen space, false untuk pan relatif terhadap posisi kamera
        controls.minDistance = 3; // Jarak zoom minimal
        controls.maxDistance = 10;  // Jarak zoom maksimal
        // controls.target.set(0, 0, 0); // Jika globe tidak di (0,0,0), sesuaikan target
        // controls.autoRotate = true; // Jika ingin auto-rotate dari OrbitControls, tapi kita sudah manual
        // controls.autoRotateSpeed = 0.5;

        // Panggil fungsi untuk membuat globe
        createGlobe();

        // Tambahkan event listener untuk klik mouse pada canvas untuk Raycasting
        renderer.domElement.addEventListener('click', onMouseClick, false);

        // Mulai loop animasi
        animate();
        console.log("Three.js initialized");
    }

    function createGlobe() {
        const geometry = new THREE.SphereGeometry(2, 64, 32); // Radius 2, segment width 64, segment height 32

        // Coba muat tekstur peta dunia
        const textureLoader = new THREE.TextureLoader();
        // URL Tekstur Peta Dunia (contoh, perlu diganti dengan yang valid dan bisa diakses)
        // Sumber potensial: Wikimedia Commons, NASA Visible Earth, dll.
        // Contoh: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Whole_world_land_and_oceans_12000.jpg/1280px-Whole_world_land_and_oceans_12000.jpg'
        // atau 'https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg' (resolusi tinggi)
        // Untuk development, saya coba salah satu, jika gagal akan ada error di console.
        const textureUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/land_ocean_ice_cloud_2048.jpg'; // Tekstur contoh dari three.js repo

        textureLoader.load(
            textureUrl,
            (texture) => {
                console.log("Tekstur peta berhasil dimuat.");
                const material = new THREE.MeshPhongMaterial({
                    map: texture,
                    shininess: 5 // Mengurangi kilau agar lebih mirip Bumi
                });
                globe = new THREE.Mesh(geometry, material);
                scene.add(globe);
                addPinsToGlobe(); // Panggil fungsi untuk menambahkan pin setelah globe siap
            },
            undefined, // onProgress callback tidak dibutuhkan
            (error) => {
                console.error('Gagal memuat tekstur peta:', error);
                // Fallback ke warna solid jika tekstur gagal dimuat
                const material = new THREE.MeshPhongMaterial({ color: 0x2288ff, shininess: 5 }); // Biru
                globe = new THREE.Mesh(geometry, material);
                scene.add(globe);
                addPinsToGlobe(); // Panggil juga di fallback
            }
        );
    }

    function addPinsToGlobe() {
        if (!globe) return; // Pastikan globe sudah ada
        // Contoh Pin
        addPin(-6.2088, 106.8456, 0xff0000, "Jakarta"); // Jakarta (Indonesia)
        addPin(34.0522, -118.2437, 0x00ff00, "Los Angeles"); // Los Angeles (USA)
        addPin(48.8566, 2.3522, 0x0000ff, "Paris"); // Paris (France)
    }


    function animate() {
        requestAnimationFrame(animate);

        // Rotasi globe
        if (globe) {
            globe.rotation.y += 0.001; // Kecepatan rotasi (lebih lambat)
        }

        if (controls) {
            controls.update(); // Hanya jika controls sudah diinisialisasi
        }

        renderer.render(scene, camera);
    }

    // Fase 3: Interaksi Peta (Pin 3D) dan Kuis
    const pins3D = []; // Array untuk menyimpan objek pin 3D
    const GLOBE_RADIUS = 2; // Harus sama dengan radius sphere globe

    // Fungsi konversi koordinat Lat/Lon ke Vector3 di permukaan sphere
    function latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);

        return new THREE.Vector3(x, y, z);
    }

    function addPin(lat, lon, color, name) {
        const pinGeometry = new THREE.SphereGeometry(0.05, 16, 8); // Geometri pin (bola kecil)
        const pinMaterial = new THREE.MeshPhongMaterial({ color: color || 0xff0000, shininess: 100 });
        const pin = new THREE.Mesh(pinGeometry, pinMaterial);

        const position = latLonToVector3(lat, lon, GLOBE_RADIUS);
        pin.position.copy(position);

        // Orientasikan pin agar "berdiri" di permukaan globe (opsional, bisa kompleks)
        // Untuk saat ini, pin hanya akan ditempatkan di permukaan.
        // pin.lookAt(globe.position); // Membuat pin menghadap ke pusat globe

        pin.userData = { type: 'pin', name: name || `Pin (${lat},${lon})` }; // Data kustom untuk identifikasi

        if (globe) { // Pastikan globe sudah ada
             // globe.add(pin); // Tambahkan pin sebagai child dari globe agar ikut berotasi
             scene.add(pin); // Atau tambahkan langsung ke scene jika ingin posisi absolut (tapi perlu update posisi jika globe berotasi manual)
                             // Untuk rotasi otomatis globe, lebih baik pin jadi child.
                             // Namun, jika globe itu sendiri yang dirotasi (globe.rotation.y += ...),
                             // maka posisi pin yang merupakan child dari globe akan ikut terotasi.
                             // Jika kita ingin pin tetap di posisi geografisnya saat globe berputar (seperti globe fisik),
                             // kita harus menempatkan pin di scene, dan MUNGKIN perlu update posisi pin jika globe itu sendiri dirotasi manual oleh user.
                             // Untuk sekarang, kita tambahkan sebagai child dari globe.
            globe.add(pin);

        } else {
            scene.add(pin); // Fallback jika globe belum siap, tapi ini kurang ideal
        }
        pins3D.push(pin);
        console.log(`Pin ${name} ditambahkan di ${lat}, ${lon}`);
    }

    // Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event) {
        // Cek apakah kita sedang dalam mode peta/globe
        if (currentStep !== 3) return;

        // Hitung posisi mouse dalam normalized device coordinates (-1 sampai +1)
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update raycaster dengan posisi kamera dan mouse
        raycaster.setFromCamera(mouse, camera);

        // Hitung objek yang dipotong oleh sinar raycaster
        // Kita hanya tertarik pada objek pin, jadi kita berikan array pins3D
        const intersects = raycaster.intersectObjects(pins3D);

        if (intersects.length > 0) {
            // Objek pertama yang terpotong adalah yang paling dekat
            const clickedPin = intersects[0].object;
            if (clickedPin.userData.type === 'pin') {
                handlePinClick(clickedPin);
            }
        }
    }
    // Tambahkan event listener ke elemen renderer (canvas)
    // Ini perlu dilakukan setelah renderer dibuat, jadi kita bisa letakkan di initThreeJS()
    // renderer.domElement.addEventListener('click', onMouseClick);


    function handlePinClick(clickedPin) {
        console.log(`Pin 3D diklik: ${clickedPin.userData.name}`);
        hideElement(mapContainer); // Sembunyikan canvas Three.js

        document.getElementById('quiz-content').innerHTML = `<p>Ini adalah kuis untuk lokasi: ${clickedPin.userData.name}. Jawablah!</p><button id="submit-quiz-button">Selesaikan Kuis</button>`;
        const submitButton = document.getElementById('submit-quiz-button');
        if (submitButton) { // Pastikan tombol ada sebelum menambah event listener
            submitButton.addEventListener('click', handleQuizSubmit);
        }
        showElement(quizContainer);
        currentStep = 4; // quiz is shown
    }

    function handleQuizSubmit() {
        if (currentStep === 4) { // quiz is shown
            console.log("Kuis diselesaikan");
            hideElement(quizContainer);
            // Logika untuk memeriksa apakah semua kuis selesai bisa ditambahkan di sini
            // Untuk sekarang, langsung tampilkan hadiah
            document.getElementById('gopay-amount').textContent = "Rp 100.000"; // Contoh nominal
            document.getElementById('secret-message').textContent = "I L O V E U"; // Contoh pesan
            showElement(finalPrizeContainer);
            currentStep = 5; // Selesai
            // Mungkin kita ingin menampilkan kembali globe setelah kuis? Atau biarkan di layar hadiah.
            // Jika ingin kembali ke globe:
            // showElement(mapContainer);
            // currentStep = 3; // Back to map/globe
        }
    }

    // Event listener untuk resize window agar canvas Three.js responsif
    window.addEventListener('resize', () => {
        if (threeJSInitialized) {
            // Update camera aspect ratio
            camera.aspect = mapContainer.clientWidth / mapContainer.clientHeight;
            camera.updateProjectionMatrix();

            // Update renderer size
            renderer.setSize(mapContainer.clientWidth, mapContainer.clientHeight);
        }
    });

    console.log("Script.js dimuat dan dijalankan.");
});
