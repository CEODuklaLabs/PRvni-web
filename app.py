from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query = request.json.get('query', '')
    print(f"Received search query: {query}")  # Debugging statement
    if query:
        # Simulate a search operation (you can replace this with actual search logic)
        results = f"Results for '{query}'"
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

