import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';

// Полифиллы для JSDOM
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Настройка тестовой среды
configure({ testIdAttribute: 'data-test' });