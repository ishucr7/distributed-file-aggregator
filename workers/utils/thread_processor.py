import threading
import queue

class ThreadProcessor:
    def __init__(self, items, target):
        self.items = items
        self.target = target
        self.threads = []
        self.results = []
        self.result_queue = queue.Queue()

    def _target_wrapper(self, args):
        result = self.target(args)
        self.result_queue.put(result)

    def _wait_for_all_threads(self):
        for process in self.threads:
            process.join()

    def _process_with_threads(self):
        for item in self.items:
            thread = threading.Thread(target=self._target_wrapper, args=(item,))
            self.threads.append(thread)
            thread.start()

    def process(self):
        self._process_with_threads()
        self._wait_for_all_threads()
        result = []
        while not self.result_queue.empty():
            array = self.result_queue.get()
            result.append(array)
        return result
