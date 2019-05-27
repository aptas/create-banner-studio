/**
 * Create Banner Studio
 *
 * Copyright © 2019 TRY/Apt
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import fn from '../src';

describe('title', () => {
  it('throws if input is not a string', done => {
    expect(() => fn(123), TypeError).toThrow(/Expected a string, got number/);
    done();
  });

  it('appends the correct message', done => {
    expect(fn('unicorns')).toEqual('unicorns & rainbows');
    done();
  });
});
