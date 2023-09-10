class FileManager:
    @staticmethod
    def read_file(file_path):
        with open(file_path, 'r') as f:
            file_content = f.read()
        return file_content

    @staticmethod
    def write_file(content, file_path):
        with open(file_path, 'w') as f:
            f.write(content)
