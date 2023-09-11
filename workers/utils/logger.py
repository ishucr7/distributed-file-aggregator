import logging
from typing import Callable, List

import structlog

processors: List[Callable] = [
    structlog.contextvars.merge_contextvars,
    structlog.processors.add_log_level,
    structlog.processors.StackInfoRenderer(),
    structlog.dev.set_exc_info
]

processors += [
    structlog.processors.TimeStamper(),
    structlog.processors.JSONRenderer()
]

structlog.configure(
    processors=processors,
    cache_logger_on_first_use=False,
    logger_factory=structlog.PrintLoggerFactory(),
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    context_class=dict,
)

def get_logger(name: str, level: int = logging.INFO) -> structlog.stdlib.BoundLogger:
    logger = structlog.get_logger(name, level=level)
    return logger.bind(logger=name)
