/* eslint-env mocha */
/* global sinon, expect */
const angular = require('angular');

require('../src/bim-select.module.js');

describe('bimSelectConfig', function() {
    beforeEach(function() {
        angular.mock.module('bim.select');
    });
    describe('provider.set()', function() {
        it('throws for unknown options', function() {
            load(provider => {
                const fn = () => {
                    provider.set('invalidSetting');
                };
                expect(fn).to.throw(Error);
                expect(fn).to.throw(/invalid/i);
                expect(fn).to.throw(/config/i);
            });
        });
    });
    it('exposes a frozen config', function() {
        load();
        run(config => {
            expect(config).to.be.frozen;
        });
    });
    describe('option sorter', function() {
        it('is exposed when set', function() {
            expectExposure('sorter', () => {});
        });
        it('requires a function', function() {
            load(provider => {
                provider.set('sorter', new Date());
            });
            expect(run).to.throw(/function/);
        });
        it('is nullable', function() {
            load(provider => {
                provider.set('sorter', null);
            });
            expect(run).to.not.throw();
        });
    });
    describe('option diacritics', function() {
        it('is exposed when set', function() {
            expectExposure('diacritics', 'strip');
        });
        it('requires a string', function() {
            load(provider => {
                provider.set('diacritics', () => {});
            });
            expect(run).to.throw(/string/);
        });
        it('is nullable', function() {
            load(provider => {
                provider.set('diacritics', null);
            });
            expect(run).to.not.throw();
        });
    });
    describe('option placeholder', function() {
        it('is exposed when set', function() {
            expectExposure('placeholder', 'My text…');
        });
        it('requires a string', function() {
            load(provider => {
                provider.set('placeholder', () => {});
            });
            expect(run).to.throw(/string/);
        });
        it('is nullable', function() {
            load(provider => {
                provider.set('placeholder', null);
            });
            expect(run).to.not.throw();
        });
    });
    describe('option itemTemplateUrl', function() {
        it('is exposed when set', function() {
            expectExposure('itemTemplateUrl', '/thing.html');
        });
        it('requires a string', function() {
            load(provider => {
                provider.set('itemTemplateUrl', () => {});
            });
            expect(run).to.throw(/string/);
        });
        it('is nullable', function() {
            load(provider => {
                provider.set('itemTemplateUrl', null);
            });
            expect(run).to.not.throw();
        });
    });
    describe('option selectedItemTemplateUrl', function () {
        it('is exposed when set', function() {
            expectExposure('selectedItemTemplateUrl', '/thing.html');
        });
        it('requires a string', function() {
            load(provider => {
                provider.set('selectedItemTemplateUrl', () => {});
            });
            expect(run).to.throw(/string/);
        });
        it('is nullable', function() {
            load(provider => {
                provider.set('selectedItemTemplateUrl', null);
            });
            expect(run).to.not.throw();
        });
    });

    const expectExposure = (option, value) => {
        load(provider => {
            provider.set(option, value);
        });
        run(config => {
            expect(config).to.have.property(option, value);
        });
    };

    const load = fn => angular.mock.module(bimSelectConfigProvider => fn && fn(bimSelectConfigProvider));
    const run = fn => angular.mock.inject(bimSelectConfig => fn && fn(bimSelectConfig));
});
