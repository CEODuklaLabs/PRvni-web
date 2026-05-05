from flask import Flask, request, jsonify, render_template
import json
import unicodedata
app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.post('/search')
def search():
    query = request.json.get('query', '')
    results = []
    print(f"Received search query: {query}")  # Debugging statement
    if query:
        # Simulate a search operation (you can replace this with actual search logic)
        with open('lib.json', 'r', encoding='utf-8') as f:
            books = json.load(f)
            for book in books:
                name = book['title'].lower()
                name = ''.join(c for c in unicodedata.normalize('NFD', name) if unicodedata.category(c) != 'Mn')
                print(f"Checking item: {name}")  # Debugging statement
                if query.lower() in name:
                    results.append(book)

        return jsonify({'results': results})
    else:
        return jsonify({'error': 'No query provided'}), 400



def load_file(file):
    try:
        with open(file, 'r') as f:
            content = f.read()
        return content
    except FileNotFoundError:
        with open(file, 'w') as f:
            f.write("This is a new file.")
        return load_file(file)
    except Exception as e:
        return f"An error occurred: {e}"
    
if __name__ == '__main__':
    app.run(debug=False)

