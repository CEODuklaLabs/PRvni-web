// Validace URL parametru: musí být kladné celé číslo
const rawId = (new URLSearchParams(window.location.search)).get('id') || '';
const id = parseInt(rawId, 10);

const bookDetail = document.getElementById('bookDetail');
const notFound = document.getElementById('notFound');

// Odmítne NaN, záporná čísla, float řetězce ("1.5"), prázdný vstup
if (!rawId || isNaN(id) || id <= 0 || !Number.isInteger(id)) {
    bookDetail.hidden = true;
    notFound.hidden = false;
} else {
    const book = BOOKS.find(b => b.id === id);

    if (!book) {
        bookDetail.hidden = true;
        notFound.hidden = false;
    } else {
        // Povoluje pouze https:// URL – blokuje javascript:, data:, file: atd.
        function isSafeUrl(url) {
            try {
                return new URL(String(url)).protocol === 'https:';
            } catch {
                return false;
            }
        }

        document.title = `${book.title} – Knihovna`;

        // textContent automaticky escapuje – žádné XSS riziko
        document.getElementById('bookTitle').textContent = book.title;
        document.getElementById('bookAuthor').textContent = book.author;
        document.getElementById('bookDescription').textContent = book.description;

        const cover = document.getElementById('bookCover');
        cover.src = isSafeUrl(book.cover) ? book.cover : '';
        cover.alt = `Přebal: ${book.title}`;
        cover.onerror = () => {
            cover.src = 'https://via.placeholder.com/220x330/e2e8f0/64748b?text=Bez+ob%C3%A1lky';
            cover.onerror = null;
        };

        const availability = document.getElementById('bookAvailability');
        availability.textContent = book.available ? '✓ Dostupná k půjčení' : '✗ Aktuálně vypůjčená';
        availability.className = `book-availability ${book.available ? 'available' : 'unavailable'}`;

        const rows = [
            ['Autor', book.author],
            ['Rok vydání', book.year],
            ['Žánr', book.genre],
            ['Počet stran', book.pages],
            ['Nakladatel', book.publisher],
            ['ISBN', book.isbn],
            ['Jazyk', book.language],
        ];

        // DOM metody místo innerHTML – žádné riziko XSS
        const tbody = document.getElementById('infoTable');
        rows.forEach(([label, value]) => {
            const tr = document.createElement('tr');
            const th = document.createElement('th');
            const td = document.createElement('td');
            th.textContent = label;
            td.textContent = value;
            tr.appendChild(th);
            tr.appendChild(td);
            tbody.appendChild(tr);
        });

        const tagsEl = document.getElementById('bookTags');
        (book.tags || []).forEach(tag => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = tag;
            tagsEl.appendChild(span);
        });
    }
}
