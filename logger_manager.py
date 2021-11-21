import logging


def init_logger():
    '''
    初始化日志配置
    '''
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.DEBUG)

    streamHandler = logging.StreamHandler()
    streamHandler.setLevel(logging.INFO)
    fileHandler = logging.FileHandler('runtime.log', 'a', 'utf-8')
    fileHandler.setLevel(logging.DEBUG)

    formatter4Stream = logging.Formatter(
        '%(asctime)s : %(message)s',
        '%H:%M:%S')
    formatter4File = logging.Formatter(
        '%(levelname)-8s - %(asctime)s(%(name)s):\n%(message)s',
        '%Y-%m-%d %H:%M:%S')

    streamHandler.setFormatter(formatter4Stream)
    fileHandler.setFormatter(formatter4File)

    logger.addHandler(streamHandler)
    logger.addHandler(fileHandler)

    return logger


logger = init_logger()
