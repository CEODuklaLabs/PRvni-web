const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const searchServerBtn = document.getElementById('searchBtn');
const bookList = document.getElementById('bookList');
const noResults = document.getElementById('noResults');
const noResultsQuery = document.getElementById('noResultsQuery');
const resultsMeta = document.getElementById('resultsMeta');
const searchHint = document.getElementById('searchHint');

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Povoluje pouze https:// URL – blokuje javascript:, data:, file: atd.
function isSafeUrl(url) {
    try {
        return new URL(String(url)).protocol === 'https:';
    } catch {
        return false;
    }
}

function normalize(str) {
    return String(str)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function searchBooks(query) {
    const q = normalize(query.trim());
    if (!q) return [];
    fetch('/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
    })
    return [];/*BOOKS.filter(book => {  
        const haystack = normalize([
            book.title,
            book.author,
            book.genre,
            book.description,
            ...(book.tags || [])
        ].join(' '));
        return haystack.includes(q);
    });*/
}

function highlight(text, query) {
    if (!query) return escapeHtml(text);
    const safe = escapeHtml(text);
    const q = escapeHtml(query.trim()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${q})`, 'gi');
    return safe.replace(re, '<mark>$1</mark>');
}

function renderResults(books, query) {
    bookList.innerHTML = '';
    noResults.hidden = true;
    searchHint.hidden = true;

    if (books.length === 0) {
        resultsMeta.textContent = '';
        noResultsQuery.textContent = `"${query}"`;
        noResults.hidden = false;
        return;
    }

    resultsMeta.textContent = `Nalezeno ${books.length} ${books.length === 1 ? 'titul' : books.length < 5 ? 'tituly' : 'titulů'}`;

    books.forEach(book => {
        const li = document.createElement('li');
        li.className = 'book-item';

        // Validace a escapování všech hodnot z datové vrstvy
        const safeId = encodeURIComponent(book.id);
        const safeCover = isSafeUrl(book.cover) ? escapeHtml(book.cover) : '';
        const safeTitle = escapeHtml(book.title);
        const safeMeta = `${escapeHtml(book.genre)} · ${escapeHtml(book.year)} · ${escapeHtml(book.pages)} str.`;
        const safeTags = (book.tags || [])
            .map(t => `<span class="tag">${escapeHtml(t)}</span>`)
            .join('');
        const badgeClass = book.available ? 'available' : 'unavailable';
        const badgeText = book.available ? 'Dostupná' : 'Vypůjčená';

        li.innerHTML = `
            <a href="book.html?id=${safeId}" class="book-item-link">
                <img class="book-thumb" src="${safeCover}" alt="${safeTitle}">
                <div class="book-item-body">
                    <span class="book-item-title">${highlight(book.title, query)}</span>
                    <span class="book-item-author">${highlight(book.author, query)}</span>
                    <span class="book-item-meta">${safeMeta}</span>
                    <div class="book-item-tags">${safeTags}</div>
                </div>
                <span class="book-badge ${badgeClass}">${badgeText}</span>
            </a>
        `;

        // onerror přes JS – žádný inline handler v HTML atributu
        const img = li.querySelector('img');
        img.onerror = function () {
            this.src = 'https://via.placeholder.com/60x90/e2e8f0/64748b?text=?';
            this.onerror = null;
        };

        bookList.appendChild(li);
    });
}

function onSearch() {
    const query = searchInput.value;
    clearBtn.style.display = query ? 'flex' : 'none';

    if (!query.trim()) {
        bookList.innerHTML = '';
        noResults.hidden = true;
        resultsMeta.textContent = '';
        searchHint.hidden = false;
        return;
    }
    console.log("Searching for:", query);
    renderResults(searchBooks(query), query);
}

//searchInput.addEventListener('input', onSearch);
searchServerBtn.addEventListener('click', onSearch);

clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    bookList.innerHTML = '';
    noResults.hidden = true;
    resultsMeta.textContent = '';
    searchHint.hidden = false;
    searchInput.focus();
});

searchInput.focus();
