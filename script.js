document.addEventListener('DOMContentLoaded', function() {
    const bookForm = document.getElementById('book-form');
    const booksList = document.getElementById('books-list');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    let currentBookId = null;
  
    // Load books when page loads
    loadBooks();
  
    // Form submission
    bookForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const bookData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        year: document.getElementById('year').value,
        isbn: document.getElementById('isbn').value
      };
  
      // Basic validation
      if (!bookData.title || !bookData.author || !bookData.year || !bookData.isbn) {
        showAlert('Please fill all fields', 'error');
        return;
      }
  
      try {
        if (currentBookId) {
          // Update existing book
          await updateBook(currentBookId, bookData);
          showAlert('Book updated successfully!', 'success');
        } else {
          // Add new book
          await addBook(bookData);
          showAlert('Book added successfully!', 'success');
        }
        
        resetForm();
        loadBooks();
      } catch (error) {
        console.error('Error:', error);
        showAlert('Operation failed', 'error');
      }
    });
  
    // Cancel button
    cancelBtn.addEventListener('click', resetForm);
  
    // Load books from server
    async function loadBooks() {
      try {
        const response = await fetch('/api/books');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const books = await response.json();
        renderBooks(books);
      } catch (error) {
        console.error('Error loading books:', error);
        showAlert('Failed to load books', 'error');
      }
    }
  
    // Add new book
    async function addBook(bookData) {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData)
      });
  
      if (!response.ok) throw new Error('Failed to add book');
      return await response.json();
    }
  
    // Update book
    async function updateBook(id, bookData) {
      const response = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData)
      });
  
      if (!response.ok) throw new Error('Failed to update book');
      return await response.json();
    }
  
    // Delete book
    async function deleteBook(id) {
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE'
      });
  
      if (!response.ok) throw new Error('Failed to delete book');
      return await response.json();
    }
  
    // Render books in the table
    function renderBooks(books) {
      booksList.innerHTML = '';
      
      books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.year}</td>
          <td>${book.isbn}</td>
          <td>
            <button class="edit-btn" data-id="${book.id}">Edit</button>
            <button class="delete-btn" data-id="${book.id}">Delete</button>
          </td>
        `;
        booksList.appendChild(row);
      });
  
      // Add event listeners to buttons
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editBook(btn.dataset.id));
      });
  
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => confirmDelete(btn.dataset.id));
      });
    }
  
    // Edit book
    async function editBook(id) {
      try {
        const response = await fetch(`/api/books/${id}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const book = await response.json();
        
        // Fill form with book data
        document.getElementById('book-id').value = book.id;
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('year').value = book.year;
        document.getElementById('isbn').value = book.isbn;
        
        // Update UI
        currentBookId = book.id;
        submitBtn.textContent = 'Update Book';
        cancelBtn.style.display = 'inline-block';
        document.getElementById('form-title').textContent = 'Edit Book';
      } catch (error) {
        console.error('Error loading book:', error);
        showAlert('Failed to load book', 'error');
      }
    }
  
    // Confirm delete
    async function confirmDelete(id) {
      if (confirm('Are you sure you want to delete this book?')) {
        try {
          await deleteBook(id);
          showAlert('Book deleted successfully!', 'success');
          loadBooks();
        } catch (error) {
          console.error('Error deleting book:', error);
          showAlert('Failed to delete book', 'error');
        }
      }
    }
  
    // Reset form
    function resetForm() {
      bookForm.reset();
      currentBookId = null;
      submitBtn.textContent = 'Add Book';
      cancelBtn.style.display = 'none';
      document.getElementById('form-title').textContent = 'Add New Book';
    }
  
    // Show alert
    function showAlert(message, type) {
      const alertDiv = document.createElement('div');
      alertDiv.className = `alert alert-${type}`;
      alertDiv.textContent = message;
      
      document.body.appendChild(alertDiv);
      
      setTimeout(() => {
        alertDiv.remove();
      }, 3000);
    }
  });