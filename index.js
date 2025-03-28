const apiUrl = "https://library-management-k1ws.vercel.app/books";
const bookList = document.getElementById("book-list");
const bookForm = document.getElementById("book-form");
const searchInput = document.createElement("input");
searchInput.type = "text";
searchInput.id = "search";
searchInput.className = "form-control mb-3";
searchInput.placeholder = "Search books...";
bookForm.parentElement.insertBefore(searchInput, bookForm);

async function displayBooks(books) {
    bookList.innerHTML = "";
    books.forEach(book => {
        const li = document.createElement("li");
        li.className = "book-item";
        li.dataset.id = book.id;

        li.innerHTML = `
            <div class="book-info">
                <div class="book-details">
                    <div class="book-title">${book.title}</div>
                    <div class="book-author">by ${book.author}</div>
                    <span class="book-year">(${book.year})</span>
                    <span class="book-status ${book.available ? 'text-success' : 'text-danger'}">
                        ${book.available ? 'Available' : 'Unavailable'}
                    </span>
                </div>
            </div>
            <div class="action-buttons">
                <button class="btn-borrow">${book.available ? 'Borrow' : 'Return'}</button>
                <button class="btn-edit">Edit</button>
                <button class="btn-delete">Delete</button>
            </div>
        `;

        li.querySelector('.btn-borrow').addEventListener('click', () => toggleAvailability(book));
        li.querySelector('.btn-edit').addEventListener('click', () => editBook(book.id));
        li.querySelector('.btn-delete').addEventListener('click', () => deleteBook(book.id));

        bookList.appendChild(li);
    });
}

async function fetchBooks() {
    try {
        const response = await fetch(apiUrl);
        const books = await response.json();
        displayBooks(books);
    } catch (error) {
        console.error("Error fetching books:", error);
    }
}

bookForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const year = document.getElementById("year").value;
    const available = true;

    try {
        await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, author, year, available })
        });
        bookForm.reset();
        await fetchBooks();
    } catch (error) {
        console.error("Error adding book:", error);
    }
});

async function editBook(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        const book = await response.json();

        const newTitle = prompt("Enter new title:", book.title);
        if (newTitle === null) return;
        const newAuthor = prompt("Enter new author:", book.author);
        if (newAuthor === null) return;
        const newYear = prompt("Enter new year:", book.year);
        if (newYear === null) return;

        const updatedBook = { ...book, title: newTitle, author: newAuthor, year: newYear };

        await fetch(`${apiUrl}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedBook)
        });

        await fetchBooks();
    } catch (error) {
        console.error("Error editing book:", error);
    }
}

async function deleteBook(id) {
    if (confirm("Are you sure you want to delete this book?")) {
        try {
            await fetch(`${apiUrl}/${id}`, {
                method: "DELETE"
            });
            await fetchBooks();
        } catch (error) {
            console.error("Error deleting book:", error);
        }
    }
}

async function toggleAvailability(book) {
    book.available = !book.available;
    try {
        await fetch(`${apiUrl}/${book.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(book)
        });
        await fetchBooks();
    } catch (error) {
        console.error("Error updating availability:", error);
    }
}

searchInput.addEventListener("input", async () => {
    const query = searchInput.value.toLowerCase();
    try {
        const response = await fetch(apiUrl);
        let books = await response.json();
        books = books.filter(book => 
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.year.toString().includes(query)
        );
        displayBooks(books);
    } catch (error) {
        console.error("Error searching books:", error);
    }
});

document.addEventListener("DOMContentLoaded", fetchBooks);
