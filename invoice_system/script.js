document.addEventListener("DOMContentLoaded", loadProducts);

// Добавление товара в список (сохранение в LocalStorage)
function addProduct() {
    let product_number = document.getElementById("product_number").value;
    let name = document.getElementById("name").value;
    let quantity = document.getElementById("quantity").value;
    let serial_number = document.getElementById("serial_number").value;
    let arrival_date = document.getElementById("arrival_date").value;
    let price = document.getElementById("price").value;

    if (!product_number || !name || !quantity || !serial_number || !arrival_date || !price) {
        alert("Пожалуйста, заполните все поля!");
        return;
    }

    let product = {
        product_number: product_number,
        name: name,
        quantity: quantity,
        serial_number: serial_number,
        arrival_date: arrival_date,
        price: price,
        total_price: quantity * price
    };

    let products = JSON.parse(localStorage.getItem("products")) || [];
    products.push(product);
    localStorage.setItem("products", JSON.stringify(products));

    loadProducts();
    clearInputFields(); // Очистка полей после добавления товара
}

// Загрузка товаров из LocalStorage в таблицу
function loadProducts() {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    let tableBody = document.getElementById("product_list");
    tableBody.innerHTML = "";

    // Сортировка по наименованию (по алфавиту)
    products.sort((a, b) => a.name.localeCompare(b.name));

    products.forEach((product) => {
        let row = `<tr>
            <td>${product.product_number}</td>
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>${product.serial_number}</td>
            <td>${product.arrival_date}</td>
            <td>${product.price}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// Очистка полей ввода после добавления товара
function clearInputFields() {
    document.getElementById("product_number").value = '';
    document.getElementById("name").value = '';
    document.getElementById("quantity").value = '';
    document.getElementById("serial_number").value = '';
    document.getElementById("arrival_date").value = '';
    document.getElementById("price").value = '';
}

// Экспорт таблицы товаров в Excel
function exportToExcel() {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    let worksheet = XLSX.utils.json_to_sheet(products);
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Товары");
    XLSX.writeFile(workbook, "products.xlsx");
}

// Запуск сканера штрих-кодов
function startScanner() {
    document.getElementById("scanner").style.display = "block";

    // Инициализация камеры для отображения
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(function(stream) {
                let videoElement = document.getElementById('scanner');
                videoElement.srcObject = stream;
                videoElement.play();
            })
            .catch(function(err) {
                console.log("Ошибка доступа к камере: ", err);
                alert("Не удается получить доступ к камере.");
            });
    }

    // Инициализация Quagga для сканирования штрих-кодов
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector("#scanner")
        },
        decoder: {
            readers: ["ean_reader", "code_128_reader", "code_39_reader"]
        }
    }, function(err) {
        if (err) {
            console.error("Ошибка при запуске Quagga: ", err);
            return;
        }
        Quagga.start();
    });

    // Обработчик события после успешного считывания штрих-кода
    Quagga.onDetected(function(result) {
        document.getElementById("product_number").value = result.codeResult.code;
        Quagga.stop();
        document.getElementById("scanner").style.display = "none";
    });
}

// Очистка всего списка товаров
function clearProductList() {
    if (confirm("Вы уверены, что хотите очистить весь список товаров?")) {
        localStorage.removeItem("products");
        loadProducts();
    }
}
