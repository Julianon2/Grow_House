const ADMIN_API_URL = 'http://localhost:5000/api/admin/products';
let currentEditingId = null;

window.editProductFromCard = async function(productId) {
    try {
        const token = localStorage.getItem('growhouse-auth-token');
        const response = await axios.get(`http://localhost:5000/api/products/${productId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const product = response.data.data;

        currentEditingId = productId;
        document.getElementById('productId').value = product.id || product._id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productBrand').value = product.brand || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productOriginalPrice').value = product.originalPrice || '';
        document.getElementById('productQuantity').value = product.quantity;
        document.getElementById('productLowStockAlert').value = product.lowStockAlert;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productMainImage').value = product.mainImage;
        document.getElementById('productStatus').value = product.status;
        document.getElementById('productFeatured').checked = product.featured;
        document.getElementById('productTags').value = (product.tags || []).join(', ');

        document.getElementById('productModal').classList.remove('hidden');

    } catch (error) {
        console.error('Error cargando producto:', error);
        alert('Error al cargar producto para editar');
    }
};

window.closeModal = function() {
    document.getElementById('productModal').classList.add('hidden');
    currentEditingId = null;
};

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('productForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
            console.log('🔍 currentEditingId:', currentEditingId);
            console.log('🔍 URL:', `${ADMIN_API_URL}/${currentEditingId}`);
            const token = localStorage.getItem('growhouse-auth-token');
            console.log('🔍 token:', token ? 'existe' : 'NULL');

        const productData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            brand: document.getElementById('productBrand').value || null,
            price: parseFloat(document.getElementById('productPrice').value),
            originalPrice: document.getElementById('productOriginalPrice').value ? parseFloat(document.getElementById('productOriginalPrice').value) : null,
            quantity: parseInt(document.getElementById('productQuantity').value),
            lowStockAlert: parseInt(document.getElementById('productLowStockAlert').value),
            description: document.getElementById('productDescription').value,
            mainImage: document.getElementById('productMainImage').value,
            status: document.getElementById('productStatus').value,
            featured: document.getElementById('productFeatured').checked,
            tags: document.getElementById('productTags').value.split(',').map(t => t.trim()).filter(t => t)
        };

        console.log('📤 Enviando datos:', JSON.stringify(productData));

        try {
            const res = await fetch(`${ADMIN_API_URL}/${currentEditingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            if (res.ok) {
                closeModal();
                alert('✅ Producto actualizado exitosamente');
                if (typeof cargarProductos === 'function') cargarProductos(currentPage);
            } else {
                const err = await res.json();
                alert(err.message || 'Error al guardar producto');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    });
});