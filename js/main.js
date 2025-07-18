/* JavaScript for Mayomba Restaurant website */

/* Wait for the DOM to fully load */
document.addEventListener('DOMContentLoaded', () => {
  // Load menu items from local JSON file
  fetch('data/menu.json')
    .then(response => response.json())
    .then(menuItems => {
      const menuContainer = document.getElementById('menu-items');

      // Cart object to store items and quantities
      const cart = {};

      // Function to update cart UI
      function updateCartUI() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalElem = document.getElementById('cart-total');
        cartItemsContainer.innerHTML = '';

        const items = Object.values(cart);
        if (items.length === 0) {
          // Show message when cart is empty
          cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
          cartTotalElem.textContent = 'KSH 0';
          return;
        }

        let total = 0;
        items.forEach(item => {
          total += item.price * item.quantity;
          const itemDiv = document.createElement('div');
          itemDiv.className = 'd-flex justify-content-between align-items-center mb-2';
          itemDiv.innerHTML = `
            <div>
              <strong>${item.name}</strong> (KSH ${item.price}) x ${item.quantity}
            </div>
            <div>
              <!-- Buttons to decrease, increase quantity and remove item -->
              <button class="btn btn-sm btn-outline-secondary me-1 decrease-qty" data-meal="${item.name}">-</button>
              <button class="btn btn-sm btn-outline-secondary increase-qty" data-meal="${item.name}">+</button>
              <button class="btn btn-sm btn-outline-danger ms-2 remove-item" data-meal="${item.name}">x</button>
            </div>
          `;
          cartItemsContainer.appendChild(itemDiv);
        });
        // Update total price display
        cartTotalElem.textContent = `KSH ${total}`;
      }

      // Function to add item to cart
      function addToCart(name, price) {
        if (cart[name]) {
          cart[name].quantity += 1; // Increase quantity if item already in cart
        } else {
          cart[name] = { name, price, quantity: 1 }; // Add new item to cart
        }
        updateCartUI();
      }

      // Dynamically create menu item cards
      menuItems.forEach(item => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';

        const card = document.createElement('div');
        card.className = 'card h-100';

        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        img.className = 'card-img-top';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = item.name;

        const desc = document.createElement('p');
        desc.className = 'card-text';
        desc.textContent = item.description;

        const price = document.createElement('p');
        price.className = 'card-text';
        price.innerHTML = `<strong>Price: KSH ${item.price}</strong>`;

        const orderBtn = document.createElement('button');
        orderBtn.className = 'btn btn-sm btn-outline-primary order-btn';
        orderBtn.textContent = 'Order Now';
        orderBtn.dataset.meal = item.name;
        orderBtn.dataset.price = item.price;

        cardBody.appendChild(title);
        cardBody.appendChild(desc);
        cardBody.appendChild(price);
        cardBody.appendChild(orderBtn);

        card.appendChild(img);
        card.appendChild(cardBody);

        col.appendChild(card);
        menuContainer.appendChild(col);
      });

      // Event listener for order buttons to add items to cart
      document.getElementById('menu-items').addEventListener('click', (e) => {
        if (e.target.classList.contains('order-btn')) {
          const mealName = e.target.dataset.meal;
          const mealPrice = parseInt(e.target.dataset.price, 10);
          addToCart(mealName, mealPrice);
          alert(`Added to cart: ${mealName} (KSH ${mealPrice})`);
        }
      });

      // Event listener for cart buttons (increase, decrease, remove)
      document.getElementById('cart-items').addEventListener('click', (e) => {
        const mealName = e.target.dataset.meal;
        if (!mealName) return;

        if (e.target.classList.contains('increase-qty')) {
          cart[mealName].quantity += 1;
          updateCartUI();
        } else if (e.target.classList.contains('decrease-qty')) {
          if (cart[mealName].quantity > 1) {
            cart[mealName].quantity -= 1;
          } else {
            delete cart[mealName];
          }
          updateCartUI();
        } else if (e.target.classList.contains('remove-item')) {
          delete cart[mealName];
          updateCartUI();
        }
      });

      // Clear cart button functionality
      document.getElementById('clear-cart').addEventListener('click', () => {
        for (const key in cart) {
          delete cart[key];
        }
        updateCartUI();
      });

      // Function to submit order to backend
      async function submitOrder(phone) {
        const items = Object.values(cart);
        if (items.length === 0) {
          alert('Your cart is empty. Please add items before submitting an order.');
          return;
        }
        if (!phone) {
          alert('Please enter your phone number to place an order.');
          return;
        }
        const orderData = {
          phone,
          items
        };
        try {
          const response = await fetch('http://localhost:3000/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
          });
          if (response.ok) {
            alert('Order placed successfully!');
            // Clear cart after successful order
            for (const key in cart) {
              delete cart[key];
            }
            updateCartUI();
            document.getElementById('phone-number').value = '';
          } else {
            alert('Failed to place order. Please try again.');
          }
        } catch (error) {
          console.error('Error submitting order:', error);
          alert('Error submitting order. Please try again later.');
        }
      }

      // Add order submission form and button
      const orderSection = document.getElementById('order-section');
      if (orderSection) {
        const phoneInput = document.createElement('input');
        phoneInput.type = 'text';
        phoneInput.id = 'phone-number';
        phoneInput.placeholder = 'Enter your phone number';
        phoneInput.className = 'form-control mb-2';

        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Submit Order';
        submitBtn.className = 'btn btn-primary';
        submitBtn.addEventListener('click', () => {
          const phone = phoneInput.value.trim();
          submitOrder(phone);
        });

        orderSection.appendChild(phoneInput);
        orderSection.appendChild(submitBtn);
      }

      // Initialize cart UI on page load
      updateCartUI();
    })
    .catch(error => {
      console.error('Error loading menu:', error);
    });

  // Additional event listener for order buttons to show thank you alert
  document.getElementById('menu-items').addEventListener('click', (e) => {
    if (e.target.classList.contains('order-btn')) {
      alert(`Thank you for ordering: ${e.target.dataset.meal}`);
    }
  });

  // Contact form validation and submission
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    // Clear previous error messages
    ['name', 'email', 'message'].forEach(id => {
      document.getElementById(id + '-error').textContent = '';
    });
    document.getElementById('form-success').style.display = 'none';

    // Validate name field
    const name = document.getElementById('name').value.trim();
    if (name === '') {
      document.getElementById('name-error').textContent = 'Name is required.';
      valid = false;
    }

    // Validate email field with regex pattern
    const email = document.getElementById('email').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === '') {
      document.getElementById('email-error').textContent = 'Email is required.';
      valid = false;
    } else if (!emailPattern.test(email)) {
      document.getElementById('email-error').textContent = 'Please enter a valid email.';
      valid = false;
    }

    // Validate message field
    const message = document.getElementById('message').value.trim();
    if (message === '') {
      document.getElementById('message-error').textContent = 'Message is required.';
      valid = false;
    }

    if (valid) {
      // Simulate form submission delay
      setTimeout(() => {
        form.reset();
        document.getElementById('form-success').style.display = 'block';
      }, 500);
    }
  });
});
