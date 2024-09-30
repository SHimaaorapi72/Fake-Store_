const navbar = document.querySelector(".custom-navbar");
const cards = document.getElementById("cards");
const dropdownMenu = document.querySelector(".dropdown-menu");
const dropdownForPrice = document.querySelector(".dropForPrice");
const priceFilterForm = document.getElementById("priceFilterForm");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("textsearch");
const productModal = new bootstrap.Modal(document.getElementById("productModal"));
const modalBody = document.querySelector("#productModal .modal-body");
const cartSection = document.getElementById("cartSection");
const cartItems = document.getElementById("cartItems");
const cartCounter = document.getElementById("cartCounter");
const viewCartButton = document.getElementById("viewCartButton");
const paginationContainer = document.querySelector("#pagination .pagination");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let filteredProducts = [];
let allProducts = [];
let currentPage = 1; 
const productsPerPage = 6; 

updateCartCounter();


async function getAllProducts() {
    try {
        const response = await fetch("https://fakestoreapi.com/products");
        const data = await response.json();
        allProducts = data; 
        filteredProducts = allProducts; 
        displayProducts(filteredProducts);
        renderPagination(filteredProducts.length); 
        return allProducts; 
    } catch (error) {
        console.error(error);
        cards.innerHTML = '<p class="text-danger">Failed to load products.</p>';
        return [];
    }
}


async function getSingleProduct(id) {
    try {
        const response = await fetch(`https://fakestoreapi.com/products/${id}`);
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}


async function showProductDetails(productId) {
    try {
        const product = await getSingleProduct(productId);
        modalBody.innerHTML = `
            <img src="${product.image}" class="img-fluid mb-3" alt="${product.title}">
            <h5>${product.title}</h5>
            <p>${product.description}</p>
        `;
        productModal.show();
    } catch (error) {
        console.error(error);
    }
}


function displayProducts(data) {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;

    const paginatedProducts = data.slice(start, end);


    cards.innerHTML = "";

    
    paginatedProducts.forEach(product => {
        cards.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-lg hover-effect">
                    <img src="${product.image}" class="card-img-top" alt="${product.title}">
                    <div class="card-body d-flex flex-column text-center">
                        <h5 class="card-title">${product.title}</h5>
                        <p class="card-text">$${product.price}</p>
                        <p class="card-text">${product.description.substring(0, 100)}...</p>
                        <div class="button-group d-flex justify-content-center mt-auto">
                            <button type="button" onclick="showProductDetails(${product.id})" class="btn btn-primary btn-sm">View details</button>
                            <button type="button" onclick="addToCart(${product.id})" class="btn btn-secondary btn-sm">Add To Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    if (paginatedProducts.length === 0) {
        cards.innerHTML = '<p class="text-center">No products found.</p>';
    }

    renderPagination(data.length);
}


function renderPagination(totalProducts) {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    paginationContainer.innerHTML = "";

    if (totalPages <= 1) return;


    const prev_button = document.createElement("li");
    prev_button.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prev_button.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    prev_button.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            displayProducts(filteredProducts);
            renderPagination(filteredProducts.length);
            scrollToTop();
        }
    });
    paginationContainer.appendChild(prev_button);

    
    for (let i = 1; i <= totalPages; i++) {
        const page = document.createElement("li");
        page.className = `page-item ${currentPage === i ? 'active' : ''}`;
        page.innerHTML = `
            <a class="page-link" href="#">${i}</a>
        `;
        page.addEventListener("click", (e) => {
            e.preventDefault();
            currentPage = i;
            displayProducts(filteredProducts);
            renderPagination(filteredProducts.length);
            scrollToTop();
        });
        paginationContainer.appendChild(page);
    }

    
    const next_button = document.createElement("li");
    next_button.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    next_button.innerHTML = `
        <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    next_button.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            displayProducts(filteredProducts);
            renderPagination(filteredProducts.length);
            scrollToTop();
        }
    });
    paginationContainer.appendChild(next_button);
}


function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


async function filterByCategory(category) {
    if (category === "all categories") {
        filteredProducts = allProducts;
    } else {
        try {
            const response = await fetch(`https://fakestoreapi.com/products/category/${category}`);
            const data = await response.json();
            filteredProducts = data;
        } catch (error) {
            console.error("Error filtering by category:", error);
            filteredProducts = [];
        }
    }
    currentPage = 1; 
    displayProducts(filteredProducts);
    renderPagination(filteredProducts.length);
}


function applyFilters(products) {
    const minPrice = parseFloat(document.getElementById("minPriceInput").value) || 0;
    const maxPrice = parseFloat(document.getElementById("maxPriceInput").value) || Infinity;

    if (minPrice > maxPrice) {
        alert("Min Price cannot be greater than Max Price.");
        return;
    }

    const filteredPriceProducts = products.filter(product => product.price >= minPrice && product.price <= maxPrice);
    filteredProducts = filteredPriceProducts;
    currentPage = 1; 
    displayProducts(filteredProducts);
    renderPagination(filteredProducts.length);
    sortProducts(currentSortOrder);
}

let currentSortOrder = 'low';
function sortProducts(order) {
    if (order === 'low') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (order === 'high') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }
    currentPage = 1; 
    displayProducts(filteredProducts);
}


dropdownForPrice.addEventListener('click', (e) => {
    if (e.target.matches('.dropdown-item')) {
        const sortOrder = e.target.getAttribute('data-sort');
        currentSortOrder = sortOrder; 
        sortProducts(currentSortOrder);
    }
});


priceFilterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    applyFilters(allProducts);
});


async function applySearch() {
    const searchTerm = searchInput.value.toLowerCase();

    if (searchTerm === "") {
        filteredProducts = allProducts;
    } else {
        filteredProducts = allProducts.filter(product => product.title.toLowerCase().includes(searchTerm));
    }
    currentPage = 1; 
    displayProducts(filteredProducts);
    renderPagination(filteredProducts.length);
}


searchInput.addEventListener('input', () => {
    applySearch();
});


// searchForm.addEventListener("submit", (e) => {
//     e.preventDefault();
//     applySearch();
// });


dropdownMenu.addEventListener("click", (e) => {
    if (e.target.matches(".dropdown-item")) {
        const category = e.target.getAttribute("data-category");
        filterByCategory(category);
    }
});


function toggleCart() {
    const productsSection = document.querySelector(".products");
    const pagination = document.getElementById("pagination");

    if (cartSection.style.display === "none" || cartSection.style.display === "") {
        productsSection.style.display = "none";
        pagination.style.display = "none";
        cartSection.style.display = "block";
    } else {
        cartSection.style.display = "none";
        productsSection.style.display = "block";
        pagination.style.display = "block";
    }
}


function updateCartCounter() {
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCounter.textContent = totalItems;
}


function addToCart(productId) {
    const cartItem = cart.find(item => item.productId === productId);
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ productId, quantity: 1 });
    }
    // alert('Product added to cart successfully');
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCounter();
}


async function calculateTotalPrice() {
    let total = 0;
    for (const item of cart) {
        const product = await getSingleProduct(item.productId);
        if (product) {
            total += product.price * item.quantity;
        }
    }
    return total;
}


async function displayCart() {
    cartItems.innerHTML = "";
    let totalPrice = await calculateTotalPrice();

    for (const item of cart) {
        const product = await getSingleProduct(item.productId);
        if (product) {
            cartItems.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-lg">
                        <img src="${product.image}" class="card-img-top" alt="${product.title}">
                        <div class="card-body d-flex flex-column text-center">
                            <h5 class="card-title">${product.title}</h5>
                            <p class="card-text">$${product.price.toFixed(2)} × ${item.quantity} = $${(product.price * item.quantity).toFixed(2)}</p>
                            <div class="button-group d-flex justify-content-center mt-auto">
                                <button type="button" onclick="updateCartQuantity(${item.productId}, ${item.quantity - 1})" class="btn btn-secondary btn-sm">-</button>
                                <span class="mx-2">${item.quantity}</span>
                                <button type="button" onclick="updateCartQuantity(${item.productId}, ${item.quantity + 1})" class="btn btn-secondary btn-sm">+</button>
                                <button type="button" onclick="removeFromCart(${item.productId})" class="btn btn-danger btn-sm ms-2">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }


    cartItems.innerHTML += `
        <div class="col-12 text-center text-white my-4">
            <h3>Total Price: $${totalPrice.toFixed(2)}</h3>
        </div>
    `;
}


function updateCartQuantity(productId, newQuantity) {
    const cartItem = cart.find(item => item.productId === productId);
    if (cartItem) {
        if (newQuantity > 0) {
            cartItem.quantity = newQuantity;
        } else {
            cart = cart.filter(item => item.productId !== productId);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCounter();
        displayCart();
    }
}


function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCounter();
    displayCart();
}


viewCartButton.addEventListener("click", () => {
    toggleCart();
    displayCart();
});


document.addEventListener("DOMContentLoaded", async () => {
    await getAllProducts();
    if (cart.length > 0) {
        displayCart();
    }
});
