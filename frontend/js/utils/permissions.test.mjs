// Verificación mínima de la matriz de permisos por rol
// Ejecutar: node --test frontend/js/utils/permissions.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { can } from './permissions.js';

test('el estudiante no administra usuarios ni cursos', () => {
  assert.equal(can('student', 'view.users'), false);
  assert.equal(can('student', 'users.manage'), false);
  assert.equal(can('student', 'courses.manage'), false);
});

test('el estudiante solo reserva y participa en el foro', () => {
  assert.equal(can('student', 'tutorias.book'), true);
  assert.equal(can('student', 'tutorias.manage'), false);
  assert.equal(can('student', 'bookings.manage'), false);
  assert.equal(can('student', 'forums.moderate'), false);
  assert.equal(can('student', 'notifications.send'), false);
});

test('el tutor gestiona tutorías, reservas y foro sin tocar usuarios', () => {
  assert.equal(can('tutor', 'tutorias.manage'), true);
  assert.equal(can('tutor', 'bookings.manage'), true);
  assert.equal(can('tutor', 'forums.moderate'), true);
  assert.equal(can('tutor', 'users.manage'), false);
});

test('el admin tiene control total', () => {
  ['view.users', 'users.manage', 'courses.manage', 'tutorias.manage', 'bookings.manage', 'forums.moderate', 'notifications.send'].forEach(
    (action) => assert.equal(can('admin', action), true)
  );
});

test('sin rol se aplica mínimo privilegio y el dashboard sigue abierto', () => {
  assert.equal(can(null, 'view.users'), false);
  assert.equal(can(null, 'users.manage'), false);
  assert.equal(can(undefined, 'view.dashboard'), true);
});
