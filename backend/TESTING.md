# Jest-Tests

## Installation

```bash
cd backend
npm install --save-dev jest supertest
```

## Ausführen

```bash
npm test              # Alle Tests ausführen
npm run test:watch   # Watch-Modus
npm run test:coverage # Mit Coverage-Bericht
```

## Test-Struktur

- `__tests__/` - Test-Dateien
- `jest.config.js` - Jest-Konfiguration
- `coverage/` - Coverage-Berichte

## Test-Kategorien

### Unit-Tests
- Controller-Tests (authController.test.js, projectController.test.js)
- Demo-Controller-Tests (demoController.test.js)

### Integration-Tests
- API-Endpunkte (api.test.js)

## Coverage-Bericht

Nach Ausführung von `npm run test:coverage` wird ein Bericht im `coverage/` Ordner erstellt.

## Beispiele

```javascript
describe('Funktionsname', () => {
  it('sollte etwas tun', async () => {
    const result = await functionToTest();
    expect(result).toBe(expectedValue);
  });
});
```