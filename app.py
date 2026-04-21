from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.post('/search')
def search():
    query = request.json.get('query', '')
    print(f"Received search query: {query}")  # Debugging statement
    if query:
        # Simulate a search operation (you can replace this with actual search logic)
        results = {
            "id": 1,
            "title": "Babička",
            "author": "Božena Němcová",
            "year": 1855,
            "genre": "Próza",
            "pages": 224,
            "publisher": "Odeon",
            "isbn": "978-80-207-1234-5",
            "language": "Čeština",
            "available": True,
            "cover": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Bozena_Nemcova_Babicka.jpg/220px-Bozena_Nemcova_Babicka.jpg",
            "description": "Babička je klasické dílo české literatury, které zachycuje idylický život na českém venkově. Němcová v něm vylíčila vzpomínky na své dětství a postavu své vlastní babičky.",
            "tags": ["klasika", "česká literatura", "venkov"]
        }

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

