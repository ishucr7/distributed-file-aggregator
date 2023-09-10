from utils.file_manager import FileManager
from utils.parallel_processor import ParallelProcessor
from utils.np import get_np_array, sum_of_arrays

def extract_array_from_file(file_path):
    file_content = FileManager.read_file(file_path)
    return get_np_array([int(x) for x in file_content.split()])

class TaskExecutor:
    def __init__(self, input_files, output_file_path):
        self.input_files = input_files
        self.output_file_path = output_file_path
        self.file_count = len(input_files)

    def _read_arrays_from_files_parallely(self):
        read_processor = ParallelProcessor(self.input_files, extract_array_from_file)
        arrays = read_processor.process()
        return arrays

    def _sum_parallely(self, arrays):
        chunks = [[arrays[0:1]], arrays[2:self.file_count - 1]]
        sum_processor = ParallelProcessor(chunks, sum_of_arrays)
        chunk_sums = sum_processor.process()
        return sum_of_arrays(chunk_sums)

    def process(self):
        output_array = []
        arrays = self._read_arrays_from_files_parallely()
        if self.file_count >= 4:
            output_array = self._sum_parallely(arrays)
        else:
            output_array = sum_of_arrays(arrays)

        FileManager.write_file(self.output_file_path, " ".join(map(str, output_array)))
