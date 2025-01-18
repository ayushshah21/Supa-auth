import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Mock window.location
const mockLocation = {
    assign: vi.fn(),
    href: '',
    origin: 'http://localhost:3000',
    pathname: '/',
}

vi.stubGlobal('location', mockLocation)

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
}); 