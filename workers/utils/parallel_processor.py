import multiprocessing

class ParallelProcessor:
    def __init__(self, items, target):
        self.items = items
        self.target = target
        self.processes = []
        self.result_queue = multiprocessing.Queue()

    def _target_wrapper(self, args):
        result = self.target(args)
        self.result_queue.put(result)

    def _wait_for_all_processes(self):
        for process in self.processes:
            process.join()

    def _process_parallely(self):
        for item in self.items:
            process = multiprocessing.Process(target=self._target_wrapper, args=(item))
            self.processes.append([process])
            process.start()

    def process(self):
        self._process_parallely()
        self._wait_for_all_processes()
        result = []
        while not self.result_queue.empty():
            array = self.result_queue.get()
            result.append(array)
        return result
