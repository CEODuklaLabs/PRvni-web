

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
