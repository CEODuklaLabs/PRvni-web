import sqlite3
import json
import os

import app

DB_PATH = 'library.db'


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS books (
            id        INTEGER PRIMARY KEY,
            title     TEXT    NOT NULL,
            author    TEXT    NOT NULL,
            year      INTEGER,
            genre     TEXT,
            pages     INTEGER,
            publisher TEXT,
            isbn      TEXT,
            language  TEXT,
            available INTEGER NOT NULL DEFAULT 1,
            cover     TEXT,
            description TEXT,
            reserve1 INTEGER,
                       
        );

        CREATE TABLE IF NOT EXISTS book_tags (
            book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
            tag     TEXT    NOT NULL,
            PRIMARY KEY (book_id, tag)
        );
    ''')
    conn.commit()
    conn.close()


def import_from_json(path='lib.json'):
    if not os.path.exists(path):
        raise FileNotFoundError(f'{path} not found')

    with open(path, 'r', encoding='utf-8') as f:
        books = json.load(f)

    conn = get_connection()
    for book in books:
        conn.execute('''
            INSERT OR REPLACE INTO books
                (id, title, author, year, genre, pages, publisher, isbn, language, available, cover, description)
            VALUES
                (:id, :title, :author, :year, :genre, :pages, :publisher, :isbn, :language, :available, :cover, :description)
        ''', {**book, 'available': int(book.get('available', True))})

        conn.execute('DELETE FROM book_tags WHERE book_id = ?', (book['id'],))
        for tag in book.get('tags', []):
            conn.execute('INSERT OR IGNORE INTO book_tags (book_id, tag) VALUES (?, ?)', (book['id'], tag))

    conn.commit()
    conn.close()
    print(f'Importováno {len(books)} knih.')


def get_all_books():
    conn = get_connection()
    rows = conn.execute('SELECT * FROM books ORDER BY id').fetchall()
    result = []
    for row in rows:
        book = dict(row)
        book['available'] = bool(book['available'])
        tags = conn.execute('SELECT tag FROM book_tags WHERE book_id = ?', (book['id'],)).fetchall()
        book['tags'] = [t['tag'] for t in tags]
        result.append(book)
    conn.close()
    return result


def get_book_by_id(book_id):
    conn = get_connection()
    row = conn.execute('SELECT * FROM books WHERE id = ?', (book_id,)).fetchone()
    if row is None:
        conn.close()
        return None
    book = dict(row)
    book['available'] = bool(book['available'])
    tags = conn.execute('SELECT tag FROM book_tags WHERE book_id = ?', (book_id,)).fetchall()
    book['tags'] = [t['tag'] for t in tags]
    conn.close()
    return book


def search_books(query):
    conn = get_connection()
    like = f'%{query}%'
    rows = conn.execute(
        'SELECT * FROM books WHERE title LIKE ? OR author LIKE ? OR description LIKE ?',
        (like, like, like)
    ).fetchall()
    result = []
    for row in rows:
        book = dict(row)
        book['available'] = bool(book['available'])
        tags = conn.execute('SELECT tag FROM book_tags WHERE book_id = ?', (book['id'],)).fetchall()
        book['tags'] = [t['tag'] for t in tags]
        result.append(book)
    conn.close()
    return result


if __name__ == '__main__':
    a= int(input("zadejte cislo:"))