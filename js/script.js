// ---------- INTRO CINEMÁTICA ----------

  const intro = document.getElementById("intro");
  const introStart = document.getElementById("introStart");
  const introButton = document.getElementById("introButton");
  const introVideo = document.getElementById("introVideo");

  // Bloquear scroll mientras está la intro
  document.body.classList.add("intro-active");

  // Al hacer click en ENTRAR
  introButton.addEventListener("click", () => {

    // Mostrar el video
    intro.classList.add("playing");

    // Reproducir video con sonido
    introVideo.play();

  });

  // Cuando termina el video
  introVideo.addEventListener("ended", () => {

    // Desaparecer intro
    intro.classList.add("hide");

    // Permitir nuevamente el scroll
    document.body.classList.remove("intro-active");

    // Eliminar intro después de la transición
    setTimeout(() => {
      intro.remove();
    }, 800);

});

  // Tabs
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
      tabs.forEach(t=>t.classList.remove('active'));
      panels.forEach(p=>p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-'+tab.dataset.tab).classList.add('active');
    });
  });


  // ---------- MODO ADMINISTRATIVO ----------
  // false = los visitantes no ven el botón Añadir.
  // true = habilita el botón para trabajar en modo administrativo.
  const ADMIN_MODE = true;

  const CATEGORIES = ['ropa', 'accesorios', 'perfumes', 'zapatos'];

  // Mostrar u ocultar los botones de añadir según el modo.
  document.querySelectorAll('.add-card').forEach(addCard => {
    addCard.style.display = ADMIN_MODE ? '' : 'none';
  });

  // ---------- VALIDAR PRODUCTOS ----------
  function isValidProduct(card) {
    const nameElement = card.querySelector('.card-name');
    const priceElement = card.querySelector('.card-price');

    if (!nameElement || !priceElement) return false;

    const name = nameElement.textContent.trim();
    const normalizedName = name.toLowerCase();

    // Rechazar nombres vacíos o textos de ejemplo.
    if (
      !name ||
      normalizedName === 'nombre del producto' ||
      normalizedName === 'nombre de la prenda' ||
      normalizedName === 'nombre del accesorio' ||
      normalizedName === 'nombre del perfume' ||
      normalizedName === 'nombre del zapato'
    ) {
      return false;
    }

    // Convierte "$ 70.000" en 70000.
    const price = Number(
      priceElement.textContent.replace(/[^\d]/g, '')
    );

    if (!Number.isFinite(price) || price <= 0) return false;

    // Debe tener al menos una imagen cargada correctamente.
    const images = card.querySelectorAll('.product-gallery img');

    const hasValidImage = Array.from(images).some(img =>
      img.complete &&
      img.naturalWidth > 0 &&
      img.naturalHeight > 0
    );

    return hasValidImage;
  }

  // ---------- CONTADOR REAL ----------
  function updateCount(cat) {
    const panel = document.getElementById('panel-' + cat);
    if (!panel) return;

    const cards = panel.querySelectorAll('.grid-products .card');

    const total = Array.from(cards).filter(isValidProduct).length;

    const counter = panel.querySelector('.count strong');
    if (counter) counter.textContent = total;
  }

  // Actualizar el contador de la categoría de una tarjeta.
  function updateCardCount(card) {
    const panel = card.closest('.panel');
    if (!panel || !panel.id.startsWith('panel-')) return;

    updateCount(panel.id.replace('panel-', ''));
  }

  // Recalcular cuando las imágenes terminen de cargar o fallen.
  function watchProductImages(card) {
    card.querySelectorAll('.product-gallery img').forEach(img => {
      if (img.dataset.countWatcher === 'true') return;

      img.dataset.countWatcher = 'true';

      img.addEventListener('load', () => updateCardCount(card));
      img.addEventListener('error', () => updateCardCount(card));
    });
  }

  // ---------- AÑADIR TARJETAS: SOLO MODO ADMIN ----------
  function duplicateCard(cat) {
    if (!ADMIN_MODE) {
      console.warn('Añadir productos está desactivado fuera del modo administrativo.');
      return;
    }

    const panel = document.getElementById('panel-' + cat);
    if (!panel) return;

    const grid = panel.querySelector('.grid-products');
    const addCard = grid?.querySelector('.add-card');
    const template = grid?.querySelector('.card');

    if (!grid || !addCard || !template) return;

    const clone = template.cloneNode(true);

    // Reiniciar los textos de la tarjeta nueva.
    clone.querySelectorAll('.editable').forEach(el => {
      if (el.classList.contains('card-price')) {
        el.textContent = '$ 0';
      } else if (el.classList.contains('card-stock')) {
        el.textContent = 'Stock: --';
      } else if (el.classList.contains('card-name')) {
        el.textContent = 'Nombre del producto';
      }
    });

    // Reiniciar el contador de observación de imágenes del clon.
    clone.querySelectorAll('.product-gallery img').forEach(img => {
      delete img.dataset.countWatcher;
    });

    grid.insertBefore(clone, addCard);

    watchProductImages(clone);
    updateCount(cat);
  }

  // ---------- INICIALIZACIÓN ----------
  CATEGORIES.forEach(cat => updateCount(cat));

  document.querySelectorAll('.grid-products .card').forEach(card => {
    watchProductImages(card);
  });


  /* carrusel */
  document.querySelectorAll(".card").forEach(card=>{

    const gallery = card.querySelector(".product-gallery");

    if(!gallery) return;

    const images = gallery.querySelectorAll(".product-img");

    let current = 0;
    let interval;


    card.addEventListener("mouseenter",()=>{

        clearInterval(interval);

        interval = setInterval(()=>{

            current++;

            gallery.style.transition="transform .6s cubic-bezier(.22,.61,.36,1)";
            gallery.style.transform=`translateX(-${current * 100}%)`;


            if(current === images.length - 1){

                setTimeout(()=>{

                    gallery.style.transition="none";

                    current=0;

                    gallery.style.transform="translateX(0%)";


                    setTimeout(()=>{

                        gallery.style.transition="transform .6s cubic-bezier(.22,.61,.36,1)";

                    },50);


                },600);

            }


        },1000);


    });


    card.addEventListener("mouseleave",()=>{

        clearInterval(interval);

        current=0;

        gallery.style.transition="transform .6s cubic-bezier(.22,.61,.36,1)";
        gallery.style.transform="translateX(0%)";

    });


});

document.querySelectorAll(".favorite-btn").forEach(btn=>{

  btn.addEventListener("click",()=>{

    btn.classList.toggle("active");

    btn.textContent = btn.classList.contains("active")
      ? "♥"
      : "♡";

  });

});

// =========================
// CARRITO DE COMPRAS
// =========================

const cartButton = document.getElementById("cartButton");
const cartPanel = document.getElementById("cartPanel");
const cartClose = document.getElementById("cartClose");
const cartOverlay = document.getElementById("cartOverlay");

const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const cartCheckout = document.getElementById("cartCheckout");

// =========================
// DATOS DEL CARRITO
// =========================

let cart = [];

try {
  cart = JSON.parse(localStorage.getItem("monsterCart")) || [];
} catch (error) {
  cart = [];
}

// =========================
// GUARDAR CARRITO
// =========================

function saveCart() {
  localStorage.setItem("monsterCart", JSON.stringify(cart));
}

// =========================
// FORMATO DE PRECIOS
// =========================

function parsePrice(priceText) {
  const number = priceText.replace(/\D/g, "");
  return Number(number) || 0;
}

function formatCOP(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(value);
}

// =========================
// SEGURIDAD PARA TEXTO EDITABLE
// =========================

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, function (character) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return entities[character];
  });
}

// =========================
// ABRIR CARRITO
// =========================

function openCart() {
  cartPanel.classList.add("open");
  cartOverlay.classList.add("open");
}

// =========================
// CERRAR CARRITO
// =========================

function closeCart() {
  cartPanel.classList.remove("open");
  cartOverlay.classList.remove("open");
}

// =========================
// AGREGAR PRODUCTO
// =========================

function addToCart(card) {

  const nameElement = card.querySelector(".card-name");
  const priceElement = card.querySelector(".card-price");
  const imageElement = card.querySelector(".product-img");

  if (!nameElement || !priceElement) {
    return;
  }

  const name = nameElement.textContent.trim();
  const price = parsePrice(priceElement.textContent);

  const image = imageElement
    ? imageElement.src
    : "";

  if (!name || price <= 0) {
    return;
  }

  const existingProduct = cart.find(
    item => item.name === name && item.price === price
  );

  if (existingProduct) {

    existingProduct.quantity += 1;

    // Actualizamos la imagen por si el producto ya existía
    existingProduct.image = image;

  } else {

    cart.push({
      name: name,
      price: price,
      quantity: 1,
      image: image
    });

  }

  saveCart();
  renderCart();
  openCart();
}

// =========================
// MOSTRAR CARRITO
// =========================

function renderCart() {

  cartItems.innerHTML = "";

  // Mostrar u ocultar el botón del carrito
  if (cart.length > 0) {
    cartButton.classList.add("has-items");
  } else {
    cartButton.classList.remove("has-items");
  }

  if (cart.length === 0) {

    cartItems.innerHTML = `
      <p class="cart-empty">
        Tu carrito está vacío.
      </p>
    `;

    cartTotal.textContent = "$ 0";
    cartCount.textContent = "0";

    return;
  }

  let total = 0;
  let totalQuantity = 0;

  cart.forEach((item, index) => {

    total += item.price * item.quantity;
    totalQuantity += item.quantity;

    const itemElement = document.createElement("div");

    itemElement.className = "cart-item";

    itemElement.innerHTML = `
      <div class="cart-item-product">

        <img
          class="cart-item-image"
          src="${item.image || "./img/logo/logo.png"}"
          alt="${escapeHtml(item.name)}"
        >

        <div class="cart-item-info">

          <span class="cart-item-name">
            ${escapeHtml(item.name)}
          </span>

          <span class="cart-item-price">
            ${formatCOP(item.price)}
          </span>

        </div>

      </div>

      <div class="cart-item-actions">

        <button
          class="cart-qty-btn"
          type="button"
          data-action="decrease"
          data-index="${index}">
          −
        </button>

        <span class="cart-quantity">
          ${item.quantity}
        </span>

        <button
          class="cart-qty-btn"
          type="button"
          data-action="increase"
          data-index="${index}">
          +
        </button>

        <button
          class="cart-remove"
          type="button"
          data-action="remove"
          data-index="${index}">
          Eliminar
        </button>

      </div>
    `;

    cartItems.appendChild(itemElement);

  });

  cartTotal.textContent = formatCOP(total);
  cartCount.textContent = totalQuantity;
}

// =========================
// BOTONES + / - / ELIMINAR
// =========================

cartItems.addEventListener("click", function (event) {

  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const index = Number(button.dataset.index);
  const action = button.dataset.action;

  if (!cart[index]) {
    return;
  }

  if (action === "increase") {

    cart[index].quantity += 1;

  }

  if (action === "decrease") {

    cart[index].quantity -= 1;

    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }

  }

  if (action === "remove") {

    cart.splice(index, 1);

  }

  saveCart();
  renderCart();

});

// =========================
// BOTONES "AGREGAR AL CARRITO"
// =========================

document.addEventListener("click", function (event) {

  const buyButton = event.target.closest(".buy-btn");

  if (!buyButton) {
    return;
  }

  const card = buyButton.closest(".card");

  if (!card) {
    return;
  }

  addToCart(card);

});

// =========================
// BOTÓN DEL CARRITO
// =========================

cartButton.addEventListener("click", openCart);

// =========================
// BOTÓN X
// =========================

cartClose.addEventListener("click", closeCart);

// =========================
// FONDO OSCURO
// =========================

cartOverlay.addEventListener("click", closeCart);

// =========================
// FINALIZAR COMPRA
// =========================

cartCheckout.addEventListener("click", function () {

  if (cart.length === 0) {

    alert("Tu carrito está vacío.");

    return;
  }

  alert(
    "Tu carrito está listo para continuar con la compra."
  );

});

// =========================
// CARGAR CARRITO AL INICIAR
// =========================

renderCart();