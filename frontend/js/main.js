const API_BASE_URL = 'http://localhost:3000/api/products';

// DOM Elements
const productsTable = document.getElementById('products-table');
const productForm = document.getElementById('product-form');
const productModal = document.getElementById('product-modal');
const modalTitle = document.getElementById('modal-title');
const closeBtn = document.querySelector('.close-btn');
const addProductBtn = document.getElementById('add-product-btn');

// Current state
let currentProductId = null;
let products = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('products.html')) {
    setupProductPage();
  } else {
    setupDashboard();
  }
});

// Dashboard functions
function setupDashboard() {
  fetchInventoryData();
}

async function fetchInventoryData() {
  try {
    const response = await fetch(API_BASE_URL);
    products = await response.json();
    
    document.getElementById('total-products').textContent = products.length;
    
    const lowStockCount = products.filter(p => p.quantity < 5).length;
    document.getElementById('low-stock').textContent = lowStockCount;
  } catch (error) {
    console.error('Error fetching inventory data:', error);
  }
}

// Product Management functions
function setupProductPage() {
  if (addProductBtn) {
    addProductBtn.addEventListener('click', () => {
      openProductModal();
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeProductModal();
    });
  }
  
  if (productForm) {
    productForm.addEventListener('submit', handleProductSubmit);
  }
  
  window.addEventListener('click', (e) => {
    if (e.target === productModal) {
      closeProductModal();
    }
  });
  
  fetchProducts();
}

async function fetchProducts() {
  try {
    const response = await fetch(API_BASE_URL);
    products = await response.json();
    renderProductsTable(products);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

function renderProductsTable(products) {
  const tbody = productsTable.querySelector('tbody');
  tbody.innerHTML = '';
  
  products.forEach(product => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${product.name}</td>
      <td class="${product.quantity < 5 ? 'low-stock' : ''}">${product.quantity}</td>
      <td>$${product.price.toFixed(2)}</td>
      <td>${product.category || '-'}</td>
      <td>
        <button class="action-btn edit-btn" data-id="${product._id}">Edit</button>
        <button class="action-btn delete-btn" data-id="${product._id}">Delete</button>
      </td>
    `;
    
    tbody.appendChild(row);
  });
  
  // Add event listeners to action buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.target.getAttribute('data-id');
      editProduct(productId);
    });
  });
  
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.target.getAttribute('data-id');
      deleteProduct(productId);
    });
  });
}

function openProductModal(product = null) {
  if (product) {
    modalTitle.textContent = 'Edit Product';
    currentProductId = product._id;
    
    document.getElementById('product-id').value = product._id;
    document.getElementById('name').value = product.name;
    document.getElementById('description').value = product.description || '';
    document.getElementById('quantity').value = product.quantity;
    document.getElementById('price').value = product.price;
    document.getElementById('category').value = product.category || '';
  } else {
    modalTitle.textContent = 'Add New Product';
    currentProductId = null;
    productForm.reset();
  }
  
  productModal.style.display = 'block';
}

function closeProductModal() {
  productModal.style.display = 'none';
  currentProductId = null;
}

async function handleProductSubmit(e) {
  e.preventDefault();
  
  const productData = {
    name: document.getElementById('name').value,
    description: document.getElementById('description').value,
    quantity: parseInt(document.getElementById('quantity').value),
    price: parseFloat(document.getElementById('price').value),
    category: document.getElementById('category').value
  };
  
  try {
    let response;
    
    if (currentProductId) {
      // Update existing product
      response = await fetch(`${API_BASE_URL}/${currentProductId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      });
    } else {
      // Create new product
      response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      });
    }
    
    if (response.ok) {
      closeProductModal();
      fetchProducts();
      if (!window.location.pathname.includes('products.html')) {
        fetchInventoryData();
      }
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  } catch (error) {
    console.error('Error saving product:', error);
    alert('Failed to save product. Please try again.');
  }
}

async function editProduct(productId) {
  const product = products.find(p => p._id === productId);
  if (product) {
    openProductModal(product);
  }
}

async function deleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      const response = await fetch(`${API_BASE_URL}/${productId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchProducts();
        if (!window.location.pathname.includes('products.html')) {
          fetchInventoryData();
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  }
}