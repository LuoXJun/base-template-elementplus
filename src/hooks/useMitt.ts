import mitt from 'mitt';

const emitter = mitt<{ test: string; demo: number }>();

export default emitter;
