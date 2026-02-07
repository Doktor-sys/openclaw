# Frontend-Tests

## Installation

```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom vitest @vitest/ui @vitest/coverage-v8
```

## Ausführen

```bash
npm test              # Alle Tests ausführen
npm run test:ui     # Test-UI öffnen
npm run test:coverage # Mit Coverage-Bericht
```

## Test-Struktur

- `src/__tests__/` - Test-Dateien
- `src/setupTests.js` - Test-Konfiguration
- `vitest.config.js` - Vitest-Konfiguration

## Test-Kategorien

### Komponenten-Tests
- Login-Tests (Login.test.jsx)
- Header-Tests (Header.test.jsx)
- Navigation-Tests (Navigation.test.jsx)
- Overview-Tests (Overview.test.jsx)

## Test-Beispiele

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('Komponentenname', () => {
  it('sollte etwas tun', () => {
    render(<Komponente />)
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
});
```

## Coverage-Bericht

Nach Ausführung von `npm run test:coverage` wird ein interaktiver Bericht erstellt.

## Best Practices

1. Tests isoliert halten
2. Mocks für externe Abhängigkeiten verwenden
3. Test-Fälle klar benennen
4. Test-Abdeckung über 80% anstreben